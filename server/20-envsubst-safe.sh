#!/bin/sh
set -e

ME=$(basename "$0")

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

template_dir="${NGINX_ENVSUBST_TEMPLATE_DIR:-/etc/nginx/templates}"
suffix="${NGINX_ENVSUBST_TEMPLATE_SUFFIX:-.template}"
output_dir="${NGINX_ENVSUBST_OUTPUT_DIR:-/etc/nginx/conf.d}"

[ -d "$template_dir" ] || exit 0

if [ ! -w "$output_dir" ]; then
    entrypoint_log "$ME: ERROR: $template_dir exists, but $output_dir is not writable"
    exit 0
fi

SUBSTITUTE_VARS="PB_DASHBOARD_ENABLED POCKETBASE_HOST"

find "$template_dir" -follow -type f -name "*$suffix" -print | while read -r template; do
    relative_path="${template#"$template_dir/"}"
    output_path="$output_dir/${relative_path%"$suffix"}"
    subdir=$(dirname "$relative_path")
    mkdir -p "$output_dir/$subdir"

    shell_vars=$(printf '$%s ' $SUBSTITUTE_VARS)
    entrypoint_log "$ME: Running envsubst (vars: $SUBSTITUTE_VARS) on $template to $output_path"
    envsubst "$shell_vars" < "$template" > "$output_path"
done
