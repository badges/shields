FROM node:12-buster

RUN apt-get update
RUN apt-get install -y jq
RUN apt-get install -y uuid-runtime
COPY entrypoint.sh /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
