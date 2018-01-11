FROM node:8.9.4-alpine

RUN apk add --no-cache gettext imagemagick librsvg ttf-dejavu git
ENV FALLBACK_FONT_PATH /usr/share/fonts/ttf-dejavu/DejaVuSans.ttf

RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/private
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install && \
    rm -rf /tmp/npm-* /root/.npm
COPY . /usr/src/app

CMD envsubst < secret.tpl.json > ./private/secret.json && npm start

EXPOSE 3000
