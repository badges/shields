'use strict';

const path = require('path');
const assert = require('assert');
const { PDFKitTextMeasurer } = require('./measure-text');
const { makeBadge, _badgeKeyWidthCache } = require('./make-badge');
const isSvg = require('is-svg');

const DEJAVU_PATH = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');

describe('The badge generator', function () {
  let measurer;
  beforeEach(function () {
    measurer = new PDFKitTextMeasurer(DEJAVU_PATH);
  });

  beforeEach(function () {
    _badgeKeyWidthCache.clear();
  });

  it('should produce SVG', function () {
    const svg = makeBadge(measurer, { text: ['cactus', 'grown'], format: 'svg' });
    assert.ok(isSvg(svg));
    assert(svg.includes('cactus'), 'cactus');
    assert(svg.includes('grown'), 'grown');
  });

  it('should cache width of badge key', function () {
    makeBadge(measurer, { text: ['cached', 'not-cached'], format: 'svg' });
    assert.deepEqual([..._badgeKeyWidthCache.cache.keys()], ['cached']);
  });

  describe('"for-the-badge" template badge generation', function () {
     // https://github.com/badges/shields/issues/1280
    it('numbers should produce a string', function () {
      const svg = makeBadge(measurer, { text: [1998, 1999], format: 'svg', template: 'for-the-badge' });
      assert(svg.includes('1998'), `${svg} does not contain '1998'`);
      assert(svg.includes('1999'), `${svg} does not contain '1999'`);
    });

    it('lowercase/mixedcase string should produce uppercase string', function () {
      const svg = makeBadge(measurer, { text: ["Label", "1 string"], format: 'svg', template: 'for-the-badge' });
      assert(svg.includes('LABEL'), `${svg} does not contain 'LABEL'`);
      assert(svg.includes('1 STRING'), `${svg} does not contain '1 TEST'`);
    });
  });
});
