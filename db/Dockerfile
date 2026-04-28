FROM elestio/pocketbase:v0.37.3

WORKDIR /app
COPY --chown=100:101 --chmod=755 ./pb_public ./pb_public
COPY --chown=100:101 --chmod=755 ./pb_hooks ./pb_hooks
COPY --chown=100:101 --chmod=755 ./pb_migrations ./pb_migrations
COPY --chmod=755 ./startup.sh ./startup.sh

EXPOSE 8090

ENTRYPOINT ["/app/startup.sh"]
