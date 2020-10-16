#!/bin/bash

# https://discuss.circleci.com/t/switch-nodejs-version-on-machine-executor-solved/26675/3
set -euo pipefail

export NVM_DIR="/opt/circleci/.nvm"
echo "0"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
echo "1"
nvm install $NODE_VERSION
echo "2"
nvm use $NODE_VERSION
echo "3"
node --version

# install the shields.io dependencies
if [[ "$NODE_VERSION" == "v10" ]]; then
    # Avoid a depcheck error.
    npm ci --ignore-scripts
else
    npm ci
fi

# run the package tests
npm run test:package
npm run check-types:package

# delete the sheilds.io dependencies
rm -rf node_modules/

# run a smoke test (render a badge with the CLI)
# with only the package dependencies installed
cd badge-maker
npm link
badge cactus grown :green @flat
