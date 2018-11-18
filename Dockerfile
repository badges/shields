FROM node:8.9.4-alpine

RUN apk add --no-cache gettext imagemagick librsvg git

RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/private
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV
COPY package.json /usr/src/app/
RUN npm install
COPY . /usr/src/app
RUN npm run build
RUN npm prune --production
RUN npm cache clean --force

CMD envsubst < secret.tpl.json > ./private/secret.json \
 && node server

EXPOSE 80
