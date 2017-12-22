'use strict';

const assert = require('assert');
const path = require('path');
const sinon = require('sinon');
const { loadFont, measure, TextMeasurer } = require('./measure-text');
const { starRating } = require('./text-formatters');

// If you have a copy of Verdana installed, you can use it to run these tests.
// Otherwise, you can run them on DejaVu Sans.
const FONT_PATH = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');
// const FONT_PATH = path.join(__dirname, '..', 'Verdana.ttf');

function almostEqualInPixels(first, second) {
  return require('almost-equal')(first, second, 1e-3);
}

describe('The text measurer', function () {
  before(function (done) {
    const fontPath = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');
    loadFont(fontPath, err => {
      assert.ok(err === null);
      done();
    });
  });

  it('should produce the same length as before for DejaVu Sans', function () {
    const actual = measure('This is the dawning of the Age of Aquariums');
    const expected = 243.546875;
    assert.equal(actual, expected);
  });
});

describe('TextMeasurer', function () {
  before(function (done) {
    loadFont(FONT_PATH, err => {
      assert.ok(err === null);
      done();
    });
  });

  let textMeasurer;
  before(function () {
    textMeasurer = new TextMeasurer();
    // Since this is slow, share it across all executions.
    textMeasurer.prepare();
  });

  let sandbox;
  beforeEach(function () {
    sandbox = sinon.sandbox.create();
    sandbox.spy(TextMeasurer, 'rawMeasure');
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
      it(`should measure '${str}' in parity with the original`, function () {
        assert.ok(almostEqualInPixels(textMeasurer.measure(str), measure(str)));
      });
    });

    strings.forEach(function (str) {
      it(`should measure '${str}' without invoking the original`, function () {
        textMeasurer.measure(str);
        assert.equal(TextMeasurer.rawMeasure.called, false);
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
          result += measure(char);
        }
        return result;
      }

      it(`should apply a width correction`, function () {
        const adjustedStrings = [];

        stringsWithKerningPairs.forEach(str => {
          const actual = textMeasurer.measure(str);
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
      it(`should measure '${str}' in parity with the original`, function () {
        assert.ok(almostEqualInPixels(textMeasurer.measure(str), measure(str)));
      });
    });

    strings.forEach(function (str) {
      it(`should invoke the original when measuring '${str}'`, function () {
        textMeasurer.measure(str);
        assert.equal(TextMeasurer.rawMeasure.called, true);
      });
    });
  });
});
