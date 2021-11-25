FROM node:16-alpine AS Builder

RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/private
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
# Without the badge-maker package.json and CLI script in place, `npm ci` will fail.
COPY badge-maker /usr/src/app/badge-maker/

RUN apk add python3 make g++
RUN npm install -g "npm@>=7"
# We need dev deps to build the front end. We don't need Cypress, though.
RUN NODE_ENV=development CYPRESS_INSTALL_BINARY=0 npm ci

COPY . /usr/src/app
RUN npm run build
RUN npm prune --production
RUN npm cache clean --force

# Use multi-stage build to reduce size
FROM node:16-alpine

ARG version=dev
ENV DOCKER_SHIELDS_VERSION=$version

# Run the server using production configs.
ENV NODE_ENV production

WORKDIR /usr/src/app
COPY --from=Builder /usr/src/app /usr/src/app

CMD node server

EXPOSE 80
