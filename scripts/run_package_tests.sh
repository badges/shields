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
if [[ "$NODE_VERSION" == "v10" ]]; then
    # Avoid a depcheck error.
    npm ci --ignore-scripts
else
    npm ci
fi

# Run the package tests.
npm run test:package
npm run check-types:package

# Delete the shields.io dependencies.
rm -rf node_modules/

# Run a smoke test (render a badge with the CLI) with only the package
# dependencies installed.
cd badge-maker
npm link
badge cactus grown :green @flat
