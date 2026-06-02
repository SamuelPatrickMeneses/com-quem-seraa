# apps/web/Dockerfile
FROM node:lts-alpine

USER node

WORKDIR /app

COPY --chown=node:node ../.. .

ENV APP_ENV=prod
CMD sh -c "npm install && if [ \"$APP_ENV\" = \"dev\" ]; then npm run dev:web:watch; else npm run dev:web:build; fi"
