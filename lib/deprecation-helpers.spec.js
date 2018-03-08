'use strict';

const { expect } = require('chai');
const { test, given } = require('sazerac');
const { isDeprecated, getDeprecatedBadge } = require('./deprecation-helpers');

describe('Deprecated Badge Helper', function() {
  it('makes "no longer available" badge', function() {
    const badge = getDeprecatedBadge('foo', {});
    expect(badge.text[0]).to.equal('foo');
    expect(badge.text[1]).to.equal('no longer available');
    expect(badge.colorscheme).to.equal('lightgray');
  });

  it('ignores colorB param', function() {
    const badge = getDeprecatedBadge('foo', {colorB: 'fedcba'});
    expect(badge.colorscheme).to.equal('lightgray');
  });
});

describe('isDeprecated function', function () {
  test(isDeprecated, function () {

    given('fooservice', new Date(), {}).expect(false);

    given(
      'fooservice',
      new Date('2001-01-11 23:59:00Z'),
      {'fooservice': new Date('2001-01-12')}
    ).expect(false);

    given(
      'fooservice',
      new Date('2001-01-12 00:00:01Z'),
      {'fooservice': new Date('2001-01-12')}
    ).expect(true);

  });
});
