#!/bin/sh
set -e
docker compose --profile test up --abort-on-container-exit --exit-code-from test
