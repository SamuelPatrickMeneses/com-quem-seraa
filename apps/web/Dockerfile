FROM node:lts-alpine AS builder

RUN mkdir -p /app/apps/web/dist

WORKDIR /app

COPY ../.. .

ENV APP_ENV=prod
CMD sh -c "npm install && if [ \"$APP_ENV\" = \"dev\" ]; then npm run dev:web:watch; else npm run dev:web:build; fi"

FROM builder AS test

USER root
RUN apk add --no-cache curl
USER node

ENV APP_ENV=dev
ENV KARMA_BROWSER=SeleniumFirefox
ENV SELENIUM_HOST=selenium-firefox
ENV SELENIUM_PORT=4444
ENV KARMA_HOSTNAME=test
CMD npm install && \
  echo 'Aguardando selenium-firefox ficar pronto...' && \
  for i in $(seq 1 30); do \
    curl -s http://selenium-firefox:4444/wd/hub/status > /dev/null 2>&1 && \
    echo 'Selenium pronto!' && break; \
    echo "Tentativa $i/30..."; sleep 2; \
  done && \
  npm run dev:web:test -- --browsers=SeleniumFirefox --no-watch --source-map=false
