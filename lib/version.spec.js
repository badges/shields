'use strict';

const assert = require('assert');
const {latest} = require('./version');

describe('latest', function () {
  it('should handle semver compatible versions', function () {
    assert.equal(latest(['1.0.0', '1.0.2', '1.0.1']), '1.0.2');
    assert.equal(latest(['1.0.0', '2.0.0', '3.0.0']), '3.0.0');
    assert.equal(latest(['0.0.1', '0.0.10', '0.0.2', '0.0.20']), '0.0.20');
  });

  it('should handle simple dotted versions', function () {
    assert.equal(latest(['0.1', '0.3', '0.2']), '0.3');
    assert.equal(latest(['0.1', '0.5', '0.12', '0.21']), '0.21');
    assert.equal(latest(['1.0', '2.0', '3.0']), '3.0');
  });

  it('should handle versions with "v" prefix', function () {
    assert.equal(latest(['v1.0.0', 'v1.0.2', 'v1.0.1']), 'v1.0.2');
    assert.equal(latest(['v1.0.0', 'v3.0.0', 'v2.0.0']), 'v3.0.0');
  });

  it('should handle versions with "-release" prefix', function () {
    assert.equal(latest(['release-1.0.0', 'release-1.0.2', 'release-1.0.20', 'release-1.0.10']), 'release-1.0.20');
  });

  it('should handle simple (one number) versions', function () {
    assert.equal(latest(['2', '10', '1']), '10');
  });
});
