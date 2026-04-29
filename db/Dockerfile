FROM elestio/pocketbase:v0.37.3

WORKDIR /app
RUN sh -c "mkdir pb_data && chown -R 100:101 pb_data && chmod -R 755 pb_data"
COPY --chown=1000:101 --chmod=755 ./pb_public ./pb_public
COPY --chown=1000:101 --chmod=755 ./pb_hooks ./pb_hooks
COPY --chown=1000:101 --chmod=755 ./pb_migrations ./pb_migrations
COPY --chmod=755 ./startup.sh ./startup.sh

EXPOSE 8090

ENTRYPOINT ["/app/startup.sh"]
