'use strict';

const defaultRegistryUrl = 'https://registry.npmjs.org';

function getNpmRegistryUrl(maybeRegistryUrl) {
  const registryUrl = maybeRegistryUrl || defaultRegistryUrl;
  return registryUrl;
}

module.exports = {
  getNpmRegistryUrl
};
