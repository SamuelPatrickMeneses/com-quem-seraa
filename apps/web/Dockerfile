# apps/web/Dockerfile
FROM node:lts-alpine

WORKDIR /app

COPY ../.. .

ENV APP_ENV=prod
CMD sh -c "npm install && if [ \"$APP_ENV\" = \"dev\" ]; then npm run dev:web:watch; else npm run dev:web:build; fi"
