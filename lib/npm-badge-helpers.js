'use strict';

const { rangeStart, minor } = require('./version');

const defaultNpmRegistryUri = 'https://registry.npmjs.org';

function makePackageDataUrl({ registryUrl, scope, packageName }) {
  registryUrl = registryUrl || defaultNpmRegistryUri;
  if (scope === undefined) {
    // e.g. https://registry.npmjs.org/express/latest
    // Use this endpoint as an optimization. It covers the vast majority of
    // these badges, and the response is smaller.
    return `${registryUrl}/${packageName}/latest`;
  } else {
    // e.g. https://registry.npmjs.org/@cedx%2Fgulp-david
    // because https://registry.npmjs.org/@cedx%2Fgulp-david/latest does not work
    const path = encodeURIComponent(`${scope}/${packageName}`);
    return `${registryUrl}/@${path}`;
  }
}

function typeDefinitions(packageData) {
  const { devDependencies } = packageData;

  const supportedLanguages = [
    { name: 'TypeScript', range: devDependencies.typescript },
    { name: 'Flow', range: devDependencies['flow-bin'] },
  ]
    .filter(lang => lang.range !== undefined)
    .map(({ name, range }) => {
      const version = minor(rangeStart(range));
      return `${name} v${version}`;
    });

  if (supportedLanguages.length > 0) {
    return supportedLanguages.join(' | ');
  } else {
    return 'none';
  }
}

module.exports = {
  defaultNpmRegistryUri,
  makePackageDataUrl,
  typeDefinitions,
};
