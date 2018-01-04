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
    expect(svg)
      .to.satisfy(isSvg)
      .and.to.include('cactus')
      .and.to.include('grown');
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
    expect(svg).to.include('1998').and.to.include('1999');
  });

  it('lowercase/mixedcase string should produce uppercase string', function () {
    const svg = makeBadge({ text: ["Label", "1 string"], format: 'svg', template: 'for-the-badge' });
    expect(svg).to.include('LABEL').and.to.include('1 STRING');
  });
});
