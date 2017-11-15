'use strict';

const {test, given} = require('sazerac');
const {licenseToColor} = require('./licenses');

describe('license helpers', () => {
  test(licenseToColor, () => {
    given('MIT').expect('green');
    given('MPL-2.0').expect('orange');
    given('Unlicense').expect('7cd958');
    given('unknown-license').expect('lightgrey');
    given(null).expect('lightgrey');
  });
});
