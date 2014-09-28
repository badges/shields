FROM ubuntu:14.04
RUN apt-get update && apt-get install -y node npm
RUN apt-get update && apt-get install -y libcairo2-dev libjpeg8-dev libpango1.0-dev libgif-dev build-essential g++
RUN npm cache clean -f
RUN npm install -g n
RUN n stable
RUN npm install canvas
RUN mkdir -p /var/app
ADD package.json /var/app/package.json
RUN cd /var/app && npm install
ADD . /var/app

ENV INFOSITE http://shields.io
WORKDIR /var/app
CMD npm run start
