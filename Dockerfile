FROM node:6.10.0-alpine

RUN apk add --no-cache imagemagick librsvg ttf-dejavu

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json /usr/src/app/
RUN npm install && \
    rm -rf /tmp/npm-* /root/.npm
COPY . /usr/src/app

RUN mkdir private && echo '{}' > private/secret.json
ENV BIND_ADDRESS 0.0.0.0
ENV INFOSITE http://shields.io
EXPOSE 80
CMD ["npm", "start"]
