const assert = require('assert');
const {
  isValidStyle,
  isDarkBackgroundStyle,
  isSixHex,
  makeLabel,
  makeBadgeData,
} = require('./badge-data');

describe('Badge data helpers', function () {
  it('should detect valid styles', function () {
    assert.equal(isValidStyle('flat'), true);
    assert.equal(isValidStyle('flattery'), false);
    assert.equal(isValidStyle(''), false);
    assert.equal(isValidStyle(undefined), false);

    assert.equal(isDarkBackgroundStyle('flat'), true);
    assert.equal(isDarkBackgroundStyle('social'), false);
    assert.equal(isDarkBackgroundStyle(''), false);
    assert.equal(isDarkBackgroundStyle(undefined), false);
  });

  it('should detect valid six-hex strings', function () {
    assert.equal(isSixHex('f00bae'), true);
    assert.equal(isSixHex('f00bar'), false);
    assert.equal(isSixHex(''), false);
    assert.equal(isSixHex(undefined), false);
  });

  it('should make labels', function () {
    assert.equal(makeLabel('my badge', {}), 'my badge');
    assert.equal(makeLabel('my badge', { label: 'no, my badge' }), 'no, my badge');
  });

  it('should make badge data', function () {
    const overrides = {
      style: 'flat-square',
      logo: '<rect></rect>',
      logoWidth: '25',
      link: 'https://example.com/',
      colorA: 'blue',
      colorB: 'f00bae',
    };

    const expected = {
      text: ['my badge', 'n/a'],
      colorscheme: 'lightgrey',
      template: 'flat-square',
      logo: 'data:<rect></rect>',
      logoWidth: 25,
      links: ['https://example.com/'],
      colorA: 'blue',
      colorB: '#f00bae',
    };

    assert.deepEqual(makeBadgeData('my badge', overrides), expected);

    expected.text[0] = overrides.label = 'no, my badge';

    assert.deepEqual(makeBadgeData('my badge', overrides), expected);
  });
});
