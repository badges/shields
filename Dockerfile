FROM node:8.9.4-alpine

RUN apk add --no-cache gettext imagemagick librsvg git

RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/private
WORKDIR /usr/src/app

ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

COPY package.json package-lock.json /usr/src/app/
# Without the gh-badges package.json and CLI script in place, `npm install` will fail.
COPY gh-badges /usr/src/app/gh-badges/
RUN npm install

COPY . /usr/src/app
RUN npm run build
RUN npm prune --production
RUN npm cache clean --force

# Do we need to list the environment variables here?
CMD node server

EXPOSE 80
