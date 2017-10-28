'use strict';

const assert = require('assert');
const {licenseToColor} = require('./licenses');

describe('licenseToColor', function () {
  it('should return value for known license', function () {
    assert.equal(licenseToColor('MIT'), 'blue');
  });

  it('should return "orange" for unknown license', function () {
    assert.equal(licenseToColor('unknown-license'), 'orange');
  });

  it('should return "orange" for license without SPDX id', function () {
    assert.equal(licenseToColor(null), 'orange');
  });
});
