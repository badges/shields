'use strict';

const assert = require('assert');
const path = require('path');
const sinon = require('sinon');
const { PDFKitTextMeasurer, QuickTextMeasurer } = require('./measure-text');
const { starRating } = require('./text-formatters');

const DEJAVU_PATH = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');

// If you have a copy of Verdana installed, you can use it to run these tests.
// Otherwise, you can run them on DejaVu Sans.
const FONT_PATH = DEJAVU_PATH;
// const FONT_PATH = path.join(__dirname, '..', 'Verdana.ttf');

function almostEqualInPixels(first, second) {
  return require('almost-equal')(first, second, 1e-3);
}

describe('PDFKitTextMeasurer with DejaVu Sans', function () {
  let measurer;
  beforeEach(function () {
    return PDFKitTextMeasurer.create(DEJAVU_PATH).then(m => { measurer = m; });
  });

  it('should produce the same length as before', function () {
    const actual = measurer.widthOf('This is the dawning of the Age of Aquariums');
    const expected = 243.546875;
    assert.equal(actual, expected);
  });
});

describe.only('QuickTextMeasurer', function () {
  let baseMeasurer;
  before(function () {
    return PDFKitTextMeasurer.create(FONT_PATH).then(m => { baseMeasurer = m; });
  });

  let quickMeasurer;
  before(function () {
    quickMeasurer = new QuickTextMeasurer(baseMeasurer);
    // Since this is slow, share it across all tests.
    quickMeasurer.prepare();
  });

  let sandbox;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.spy(baseMeasurer, 'widthOf');
  });

  afterEach(function () {
    if (sandbox) {
      sandbox.restore();
      sandbox = null;
    }
  });

  context('when given ASCII strings', function () {
    const strings = [
      'This is the dawning of the Age of Aquariums',
      'v1.2.511',
      '5 passed, 2 failed, 1 skipped',
      '[prismic "1.1"]',
    ];

    strings.forEach(function (str) {
      it(`should measure '${str}' in parity with the base`, function () {
        assert.ok(almostEqualInPixels(quickMeasurer.widthOf(str), baseMeasurer.widthOf(str)));
      });
    });

    strings.forEach(function (str) {
      it(`should measure '${str}' without invoking the base`, function () {
        quickMeasurer.widthOf(str);
        assert.equal(baseMeasurer.widthOf.called, false);
      });
    });

    context('when the font includes a kerning pair', function () {
      const stringsWithKerningPairs = [
        'Q-tips', // In DejaVu, Q- is a kerning pair.
        'B-flat', // In Verdana, B- is a kerning pair.
      ];

      function widthByMeasuringCharacters(str) {
        let result = 0;
        for (const char of str) {
          result += baseMeasurer.widthOf(char);
        }
        return result;
      }

      it(`should apply a width correction`, function () {
        const adjustedStrings = [];

        stringsWithKerningPairs.forEach(str => {
          const actual = quickMeasurer.widthOf(str);
          const unadjusted = widthByMeasuringCharacters(str);
          if (!almostEqualInPixels(actual, unadjusted)) {
            adjustedStrings.push(str);
          }
        });

        assert.ok(adjustedStrings.length > 0);
      });
    });
  });

  context('when given non-ASCII strings', function () {
    const strings = [
      starRating(3.5),
      '\u2026',
    ];

    strings.forEach(function (str) {
      it(`should measure '${str}' in parity with the base`, function () {
        assert.ok(almostEqualInPixels(quickMeasurer.widthOf(str), baseMeasurer.widthOf(str)));
      });
    });

    strings.forEach(function (str) {
      it(`should invoke the base when measuring '${str}'`, function () {
        quickMeasurer.widthOf(str);
        assert.equal(baseMeasurer.widthOf.called, true);
      });
    });
  });
});
