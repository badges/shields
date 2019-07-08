FROM node:8-alpine

RUN mkdir -p /usr/src/app
RUN mkdir /usr/src/app/private
WORKDIR /usr/src/app

COPY package.json package-lock.json /usr/src/app/
# Without the gh-badges package.json and CLI script in place, `npm ci` will fail.
COPY gh-badges /usr/src/app/gh-badges/

# We need dev deps to build the front end. We don't need Cypress, though.
RUN NODE_ENV=development CYPRESS_INSTALL_BINARY=0 npm ci

COPY . /usr/src/app
RUN npm run build
RUN npm prune --production
RUN npm cache clean --force

# Run the server using production configs.
ENV NODE_ENV production

CMD node server

EXPOSE 80
