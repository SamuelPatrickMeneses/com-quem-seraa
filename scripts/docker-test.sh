#!/bin/sh
set -e
docker compose -f docker-compose.yml -f docker-compose.dev.yml --profile test up --abort-on-container-exit --exit-code-from test --remove-orphans
