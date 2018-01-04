'use strict';

const { test, given } = require('sazerac');
const {
  minorVersion,
  versionReduction
} = require('./php-version');

const phpReleases = ['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '7.0', '7.1', '7.2'];

describe('Text PHP version', function() {
  test(minorVersion, () => {
      given('7').expect('7.0');
      given('7.1').expect('7.1');
      given('5.3.3').expect('5.3');
      given('hhvm').expect('');
  });

  test(versionReduction, () => {
    given(['5.3', '5.4', '5.5'], phpReleases).expect('5.3 - 5.5');
    given(['5.4', '5.5', '5.6', '7.0', '7.1'], phpReleases).expect('5.4 - 7.1');
    given(['5.5', '5.6', '7.0', '7.1', '7.2'], phpReleases).expect('>= 5.5');
    given(['5.5', '5.6', '7.1', '7.2'], phpReleases).expect('5.5, 5.6, 7.1, 7.2');
    given(['7.0', '7.1', '7.2'], phpReleases).expect('>= 7');
    given(['5.0', '5.1', '5.2', '5.3', '5.4', '5.5', '5.6', '7.0', '7.1', '7.2'], phpReleases).expect('>= 5');
    given(['7.1', '7.2'], phpReleases).expect('>= 7.1');
    given(['7.1'], phpReleases).expect('7.1');
    given(['8.1'], phpReleases).expect('');
    given([]).expect('');
  });
});
