'use strict';

const { test, given, forCases } = require('sazerac');
const {
  isValidStyle,
} = require('./supported-features');

describe('Utilities for supported features', function() {
  test(isValidStyle, () => {
    forCases([
      given('flat'),
      given('default'),
    ]).expect(true);
    forCases([
      given('flattery'),
      given(''),
      given(undefined),
    ]).expect(false);
  });
});
