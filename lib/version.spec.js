'use strict';

const { test, given } = require('sazerac');
const { latest, slice, rangeStart } = require('./version');

describe('Version helpers', function () {
  test(latest, () => {
    // semver-compatible versions.
    given(['1.0.0', '1.0.2', '1.0.1']).expect('1.0.2');
    given(['1.0.0', '2.0.0', '3.0.0']).expect('3.0.0');
    given(['0.0.1', '0.0.10', '0.0.2', '0.0.20']).expect('0.0.20');

    // Simple dotted versions.
    given(['1.0.0', 'v1.0.2', 'r1.0.1', 'release-2.0.0']).expect('release-2.0.0');
    given(['1.0.0', 'v2.0.0', 'r1.0.1', 'release-1.0.3']).expect('v2.0.0');
    given(['2.0.0', 'v1.0.3', 'r1.0.1', 'release-1.0.3']).expect('2.0.0');
    given(['1.0.0', 'v1.0.2', 'r2.0.0', 'release-1.0.3']).expect('r2.0.0');

    // Versions with 'v' prefix.
    given(['0.1', '0.3', '0.2']).expect('0.3');
    given(['0.1', '0.5', '0.12', '0.21']).expect('0.21');
    given(['1.0', '2.0', '3.0']).expect('3.0');

    // Versions with '-release' prefix
    given(['v1.0.0', 'v1.0.2', 'v1.0.1']).expect('v1.0.2');
    given(['v1.0.0', 'v3.0.0', 'v2.0.0']).expect('v3.0.0');

    // Versions with '-release' prefix
    given(['release-1.0.0', 'release-1.0.2', 'release-1.0.20', 'release-1.0.3']).expect('release-1.0.20');

    // Simple (one-number) versions
    given(['2', '10', '1']).expect('10');
  });

  test(slice, () => {
    given('2.4.7', 'major').expect('2');
    given('2.4.7', 'minor').expect('2.4');
    given('2.4.7', 'patch').expect('2.4.7');
    given('2.4.7-alpha.1', 'major').expect('2-alpha.1');
    given('2.4.7-alpha.1', 'minor').expect('2.4-alpha.1');
    given('2.4.7-alpha.1', 'patch').expect('2.4.7-alpha.1');
  });

  test(rangeStart, () => {
    given('^2.4.7').expect('2.4.7');
  });
});
