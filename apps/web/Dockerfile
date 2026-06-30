FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY apps/web/package*.json apps/web/
RUN npm install

COPY . .
RUN npm run build -w apps/web

FROM builder AS dev

ENV APP_ENV=dev
CMD npm run dev:web:watch

FROM builder AS test

USER root
RUN apk add --no-cache curl
USER node

ENV APP_ENV=dev
ENV KARMA_BROWSER=SeleniumFirefox
ENV SELENIUM_HOST=selenium-firefox
ENV SELENIUM_PORT=4444
ENV KARMA_HOSTNAME=test
CMD echo 'Aguardando selenium-firefox ficar pronto...' && \
  for i in $(seq 1 30); do \
    curl -s http://selenium-firefox:4444/wd/hub/status > /dev/null 2>&1 && \
    echo 'Selenium pronto!' && break; \
    echo "Tentativa $i/30..."; sleep 2; \
  done && \
  npm run dev:web:test -- --browsers=SeleniumFirefox --no-watch --source-map=false

FROM nginx:alpine AS production

COPY --from=builder /app/apps/web/dist/frontend/browser /usr/share/nginx/html
COPY server/default.conf.template /etc/nginx/templates/default.conf.template
