'use strict';

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const sinon = require('sinon');
const { PDFKitTextMeasurer, QuickTextMeasurer } = require('./measure-text');
const { starRating } = require('./text-formatters');

const DEJAVU_PATH = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');
const VERDANA_PATH = path.join(__dirname, '..', 'Verdana.ttf');

function almostEqualInPixels(first, second) {
  return require('almost-equal')(first, second, 1e-3);
}

describe('PDFKitTextMeasurer with DejaVu Sans', function () {
  it('should produce the same length as before', function () {
    const measurer = new PDFKitTextMeasurer(DEJAVU_PATH);
    const actual = measurer.widthOf('This is the dawning of the Age of Aquariums');
    const expected = 243.546875;
    assert.equal(actual, expected);
  });
});

function registerTests(fontPath, displayName, skip) {
  // Invoke `.skip()` within the `it`'s so we get logging of the skipped tests.

  describe(`QuickTextMeasurer with ${displayName}`, function () {
    let quickMeasurer;
    if (! skip) {
      before(function () {
        // Since this is slow, share it across all tests.
        quickMeasurer = new QuickTextMeasurer(fontPath);
      });
    }

    let sandbox;
    let pdfKitWidthOf;
    let pdfKitMeasurer;
    if (! skip) {
      // Boo, the sandbox doesn't get cleaned up after a skipped test.
      beforeEach(function () {
        sandbox = sinon.sandbox.create();
        pdfKitWidthOf = sandbox.spy(PDFKitTextMeasurer.prototype, 'widthOf');
        pdfKitMeasurer = new PDFKitTextMeasurer(fontPath);
      });

      afterEach(function () {
        if (sandbox) {
          sandbox.restore();
          sandbox = null;
        }
      });
    }

    context('when given ASCII strings', function () {
      const strings = [
        'This is the dawning of the Age of Aquariums',
        'v1.2.511',
        '5 passed, 2 failed, 1 skipped',
        '[prismic "1.1"]',
      ];

      strings.forEach(function (str) {
        it(`should measure '${str}' in parity with PDFKit`, function () {
          if (skip) { this.skip(); }
          assert.ok(almostEqualInPixels(quickMeasurer.widthOf(str), pdfKitMeasurer.widthOf(str)));
        });
      });

      strings.forEach(function (str) {
        it(`should measure '${str}' without invoking PDFKit`, function () {
          if (skip) { this.skip(); }
          quickMeasurer.widthOf(str);
          assert.equal(pdfKitWidthOf.called, false);
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
            result += pdfKitMeasurer.widthOf(char);
          }
          return result;
        }

        it(`should apply a width correction`, function () {
          if (skip) { this.skip(); }

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
        it(`should measure '${str}' in parity with PDFKit`, function () {
          if (skip) { this.skip(); }
          assert.ok(almostEqualInPixels(quickMeasurer.widthOf(str), pdfKitMeasurer.widthOf(str)));
        });
      });

      strings.forEach(function (str) {
        it(`should invoke the base when measuring '${str}'`, function () {
          if (skip) { this.skip(); }
          quickMeasurer.widthOf(str);
          assert.equal(pdfKitWidthOf.called, true);
        });
      });
    });
  });
};

registerTests(DEJAVU_PATH, 'DejaVu Sans');
registerTests(VERDANA_PATH, 'Verdana', !fs.existsSync(VERDANA_PATH));
