'use strict';

const assert = require('assert');
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
    assert.ok(isSvg(svg));
    assert(svg.includes('cactus'), 'cactus');
    assert(svg.includes('grown'), 'grown');
  });

  it('should cache width of badge key', function () {
    makeBadge({ text: ['cached', 'not-cached'], format: 'svg' });
    assert.deepEqual([..._badgeKeyWidthCache.cache.keys()], ['cached']);
  });

  it('should replace unknown json template with "default"', function () {
    const jsonBadgeWithUnknownStyle = makeBadge({ text: ['name', 'Bob'], format: 'json', template: 'unknown_style' });
    const jsonBadgeWithDefaultStyle = makeBadge({ text: ['name', 'Bob'], format: 'json', template: 'default' });
    assert.strictEqual(jsonBadgeWithUnknownStyle, jsonBadgeWithDefaultStyle);
  });

  it('should replace unknown svg template with "flat"', function () {
    const jsonBadgeWithUnknownStyle = makeBadge({ text: ['name', 'Bob'], format: 'svg', template: 'unknown_style' });
    const jsonBadgeWithDefaultStyle = makeBadge({ text: ['name', 'Bob'], format: 'svg', template: 'flat' });
    assert.strictEqual(jsonBadgeWithUnknownStyle, jsonBadgeWithDefaultStyle);
  });
});

describe('"for-the-badge" template badge generation', function () {
   // https://github.com/badges/shields/issues/1280
  it('numbers should produce a string', function () {
    const svg = makeBadge({ text: [1998, 1999], format: 'svg', template: 'for-the-badge' });
    assert(svg.includes('1998'), `${svg} does not contain '1998'`);
    assert(svg.includes('1999'), `${svg} does not contain '1999'`);
  });

  it('lowercase/mixedcase string should produce uppercase string', function () {
    const svg = makeBadge({ text: ["Label", "1 string"], format: 'svg', template: 'for-the-badge' });
    assert(svg.includes('LABEL'), `${svg} does not contain 'LABEL'`);
    assert(svg.includes('1 STRING'), `${svg} does not contain '1 TEST'`);
  });
});
