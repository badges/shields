'use strict';

const assert = require('assert');
const {licenseToColor} = require('./licenses');

describe('licenseToColor', function () {
  it('should return value for known license', function () {
    assert.equal(licenseToColor('MIT'), 'green');
  });

  it('should return "lightgrey" for unknown license', function () {
    assert.equal(licenseToColor('unknown-license'), 'lightgrey');
  });

  it('should return "lightgrey" for license without SPDX id', function () {
    assert.equal(licenseToColor(null), 'lightgrey');
  });
});
