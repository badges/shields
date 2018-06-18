'use strict';

const { test, given } = require('sazerac');
const NpmTypeDefinitions = require('./npm-type-definitions');

describe('NPM type definitions badge', function () {
  test(NpmTypeDefinitions.render, () => {
    given({ devDependencies: { typescript: '^2.4.7' } })
      .expect({ message: 'TypeScript v2.4', color: 'blue' });
  });
});
