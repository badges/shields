'use strict';

const { expect } = require('chai');
const { _badgeKeyWidthCache } = require('./make-badge');
const isSvg = require('is-svg');
const testHelpers = require('./make-badge-test-helpers');

const makeBadge = testHelpers.makeBadge();

describe('The badge generator', function () {
  beforeEach(function () {
    _badgeKeyWidthCache.clear();
  });

  it('should produce SVG', function () {
    const svg = makeBadge({ text: ['cactus', 'grown'], format: 'svg' });
    expect(svg).to.satisfy(isSvg);
    expect(svg).to.contain('cactus').and.to.contain('grown');
  });

  it('should cache width of badge key', function () {
    makeBadge({ text: ['cached', 'not-cached'], format: 'svg' });
    expect(_badgeKeyWidthCache.cache).to.have.keys('cached');
  });
});

describe('"for-the-badge" template badge generation', function () {
   // https://github.com/badges/shields/issues/1280
  it('numbers should produce a string', function () {
    const svg = makeBadge({ text: [1998, 1999], format: 'svg', template: 'for-the-badge' });
    expect(svg).to.contain('1998').and.to.contain('1999');
  });

  it('lowercase/mixedcase string should produce uppercase string', function () {
    const svg = makeBadge({ text: ["Label", "1 string"], format: 'svg', template: 'for-the-badge' });
    expect(svg).to.contain('LABEL').and.to.contain('1 STRING');
  });
});
