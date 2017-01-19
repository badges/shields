FROM node:6.9.2-alpine

RUN apk add --update gettext

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app

CMD envsubst < secret.tpl.json > secret.json && npm start

EXPOSE 80
