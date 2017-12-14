#!/bin/bash

set -eo pipefail

apt-get -y update
apt-get install -y --no-install-recommends fonts-dejavu-core
apt-get clean
rm -rf /var/lib/apt/lists/*

npm install -g greenkeeper-lockfile@1
