'use strict';

const { test, given } = require('sazerac');
const {
  isHhvm,
  versionReduction
} = require('./php-version');

describe('Text PHP version', function() {
  test(isHhvm, () => {
    given('hhvm').expect(true);
    given('hhvm-3.18').expect(true);
    given('7.1').expect(false);
  });

  test(versionReduction, () => {
    given(['5.3', '5.4', '5.5']).expect('5.3 - 5.5');
    given(['5.4', '5.5', '5.6', '7.0', '7.1']).expect('5.3 - 7.1');
    given(['5.5', '5.6', '7.0', '7.1', '7.2']).expect('>= 5.5');
    given(['7.0', '7.1', '7.2']).expect('>= 7');
    given(['7.1', '7.2']).expect('>= 7.1');
    given(['7.1']).expect('7.1');
    given(['8.1']).expect('');
    given([]).expect('');
  });
});
