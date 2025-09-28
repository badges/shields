FROM node:22-alpine AS builder

RUN npm install -g "npm@^10"

RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/private
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
# Without the badge-maker package.json and CLI script in place, `npm ci` will fail.
COPY badge-maker /usr/src/app/badge-maker/

# We need dev deps to build the front end. We don't need Cypress, though.
RUN NODE_ENV=development CYPRESS_INSTALL_BINARY=0 npm ci

COPY . /usr/src/app

RUN npm run build \
    && npm prune --omit=dev --force \
    && rm -rf node_modules/.cache \
    && rm -rf frontend package-lock.json


# Use multi-stage build to reduce size
FROM node:22-alpine

ARG version=dev
ENV DOCKER_SHIELDS_VERSION=$version
LABEL version=$version
LABEL fly.version=$version

# Run the server using production configs.
ENV NODE_ENV=production

WORKDIR /usr/src/app
COPY --from=builder --chown=0:0 /usr/src/app /usr/src/app

CMD ["node", "server"]

EXPOSE 80 443
