'use strict';

const assert = require('assert');
const licenseToColor = require('./licenses');

describe('licenseToColor', function () {
  it('should has entry for known license', function () {
    assert.equal(licenseToColor['MIT'], 'blue');
  });
});
