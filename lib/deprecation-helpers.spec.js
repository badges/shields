'use strict';

const { assert } = require('chai');
const { test, given } = require('sazerac');
const { isDeprecated, getDeprecatedBadge } = require('./deprecation-helpers');

describe('Deprecated Badge Helper', function() {
  it('makes "no longer available" badge', function() {
    const badge = getDeprecatedBadge('foo', {});
    assert.equal('foo', badge.text[0]);
    assert.equal('no longer available', badge.text[1]);
    assert.equal('lightgray', badge.colorscheme);
  });
});

describe('isDeprecated function', function () {
  test(isDeprecated, function () {

    given('fooservice', new Date(), {}).expect(false);

    given(
      'fooservice',
      new Date('2001-01-11 23:59:00'),
      {'fooservice': new Date('2001-01-12')}
    ).expect(false);

    given(
      'fooservice',
      new Date('2001-01-12 00:00:01'),
      {'fooservice': new Date('2001-01-12')}
    ).expect(true);

  });
});
