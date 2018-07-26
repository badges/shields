'use strict';

const { test, given } = require('sazerac');
const { typeDefinitions } = require('./npm-badge-helpers');

describe('NPM badge helpers', function () {
  test(typeDefinitions, () => {
    given({ devDependencies: { typescript: '^2.4.7' } }).expect('TypeScript v2.4');
  });
});
