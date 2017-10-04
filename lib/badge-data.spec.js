'use strict';

const assert = require('assert');
const {
  isDataUri,
  hasPrefix,
  isValidStyle,
  isSixHex,
  makeLabel,
  makeLogo,
  makeBadgeData,
} = require('./badge-data');

describe('Badge data helpers', function() {
  it('should detect prefixes', function() {
    assert.equal(hasPrefix('data:image/svg+xml;base64,PHN2ZyB4bWxu', 'data:'), true);
    assert.equal(hasPrefix('data:foobar', 'data:'), true);
    assert.equal(hasPrefix('foobar', 'data:'), false);
  });

  it('should detect valid image data URIs', function() {
    assert.equal(isDataUri('data:image/svg+xml;base64,PHN2ZyB4bWxu'), true);
    assert.equal(isDataUri('data:foobar'), false);
    assert.equal(isDataUri('foobar'), false);
  });

  it('should detect valid styles', function() {
    assert.equal(isValidStyle('flat'), true);
    assert.equal(isValidStyle('flattery'), false);
    assert.equal(isValidStyle(''), false);
    assert.equal(isValidStyle(undefined), false);
  });

  it('should detect valid six-hex strings', function() {
    assert.equal(isSixHex('f00bae'), true);
    assert.equal(isSixHex('f00bar'), false);
    assert.equal(isSixHex(''), false);
    assert.equal(isSixHex(undefined), false);
  });

  it('should make labels', function() {
    assert.equal(makeLabel('my badge', {}), 'my badge');
    assert.equal(makeLabel('my badge', { label: 'no, my badge' }), 'no, my badge');
  });

  it('should make logos', function() {
    assert.equal(
      makeLogo('gratipay', { logo: 'image/svg+xml;base64,PHN2ZyB4bWxu' }),
      'data:image/svg+xml;base64,PHN2ZyB4bWxu');
    assert.equal(
      makeLogo('gratipay', { logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu' }),
      'data:image/svg+xml;base64,PHN2ZyB4bWxu');
    assert.equal(
      makeLogo('gratipay', { logo: '' }),
      undefined);
    assert.equal(
      makeLogo(undefined, {}),
      undefined);
    assert.ok(isDataUri(makeLogo('gratipay', {})));
  });

  it('should make badge data', function() {
    const overrides = {
      label: 'no, my badge',
      style: 'flat-square',
      logo: 'image/svg+xml;base64,PHN2ZyB4bWxu',
      logoWidth: '25',
      link: 'https://example.com/',
      colorA: 'blue',
      colorB: 'f00bae',
    };

    const expected = {
      text: ['no, my badge', 'n/a'],
      colorscheme: 'lightgrey',
      template: 'flat-square',
      logo: 'data:image/svg+xml;base64,PHN2ZyB4bWxu',
      logoWidth: 25,
      links: ['https://example.com/'],
      colorA: 'blue',
      colorB: '#f00bae',
    };

    assert.deepEqual(makeBadgeData('my badge', overrides), expected);
  });
});
