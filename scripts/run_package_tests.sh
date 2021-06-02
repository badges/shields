#!/bin/bash

# https://discuss.circleci.com/t/switch-nodejs-version-on-machine-executor-solved/26675/3

# Start off less strict to work around various nvm errors.
set -e
export NVM_DIR="/opt/circleci/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
nvm install $NODE_VERSION
nvm use $NODE_VERSION

# Stricter.
set -euo pipefail
node --version

# Install the shields.io dependencies.
npm ci

# Run the package tests.
npm run test:package
npm run check-types:package

# Delete the full shields.io dependency tree
rm -rf node_modules/


# Run a smoke test (render a badge with the CLI) with only the package
# dependencies installed.
cd badge-maker

npm install # install only the package dependencies for this test
npm link
badge cactus grown :green @flat
rm package-lock.json && rm -rf node_modules/ # clean up package dependencies
