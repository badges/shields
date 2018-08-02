'use strict'

const { expect } = require('chai')
const path = require('path')
const fs = require('fs')
const sinon = require('sinon')
const { PDFKitTextMeasurer, QuickTextMeasurer } = require('./text-measurer')
const { starRating } = require('./text-formatters')
const defaults = require('./defaults')
const testHelpers = require('./make-badge-test-helpers')
const almostEqual = require('almost-equal')

const EPSILON_PIXELS = 1e-3

describe('PDFKitTextMeasurer with DejaVu Sans', function() {
  it('should produce the same length as before', function() {
    const measurer = new PDFKitTextMeasurer(testHelpers.font.path)
    expect(
      measurer.widthOf('This is the dawning of the Age of Aquariums')
    ).to.equal(243.546875)
  })
})

function registerTests(fontPath, skip) {
  // Invoke `.skip()` within the `it`'s so we get logging of the skipped tests.
  const displayName = path.basename(fontPath, path.extname(fontPath))

  describe(`QuickTextMeasurer with ${displayName}`, function() {
    let quickMeasurer
    if (!skip) {
      before(function() {
        // Since this is slow, share it across all tests.
        quickMeasurer = new QuickTextMeasurer(fontPath)
      })
    }

    let sandbox
    let pdfKitWidthOf
    let pdfKitMeasurer
    if (!skip) {
      // Boo, the sandbox doesn't get cleaned up after a skipped test.
      beforeEach(function() {
        // This often times out: https://circleci.com/gh/badges/shields/2786
        this.timeout(5000)
        sandbox = sinon.createSandbox()
        pdfKitWidthOf = sandbox.spy(PDFKitTextMeasurer.prototype, 'widthOf')
        pdfKitMeasurer = new PDFKitTextMeasurer(fontPath)
      })

      afterEach(function() {
        if (sandbox) {
          sandbox.restore()
          sandbox = null
        }
      })
    }

    context('when given ASCII strings', function() {
      const strings = [
        'This is the dawning of the Age of Aquariums',
        'v1.2.511',
        '5 passed, 2 failed, 1 skipped',
        '[prismic "1.1"]',
      ]

      strings.forEach(function(str) {
        it(`should measure '${str}' in parity with PDFKit`, function() {
          if (skip) {
            this.skip()
          }
          expect(quickMeasurer.widthOf(str)).to.be.closeTo(
            pdfKitMeasurer.widthOf(str),
            EPSILON_PIXELS
          )
        })
      })

      strings.forEach(function(str) {
        it(`should measure '${str}' without invoking PDFKit`, function() {
          if (skip) {
            this.skip()
          }
          quickMeasurer.widthOf(str)
          expect(pdfKitWidthOf).not.to.have.been.called
        })
      })

      context('when the font includes a kerning pair', function() {
        const stringsWithKerningPairs = [
          'Q-tips', // In DejaVu, Q- is a kerning pair.
          'B-flat', // In Verdana, B- is a kerning pair.
        ]

        function widthByMeasuringCharacters(str) {
          let result = 0
          for (const char of str) {
            result += pdfKitMeasurer.widthOf(char)
          }
          return result
        }

        it(`should apply a width correction`, function() {
          if (skip) {
            this.skip()
          }

          const adjustedStrings = []

          stringsWithKerningPairs.forEach(str => {
            const actual = quickMeasurer.widthOf(str)
            const unadjusted = widthByMeasuringCharacters(str)
            if (!almostEqual(actual, unadjusted, EPSILON_PIXELS)) {
              adjustedStrings.push(str)
            }
          })

          expect(adjustedStrings).to.be.an('array').that.is.not.empty
        })
      })
    })

    context('when given non-ASCII strings', function() {
      const strings = [starRating(3.5), '\u2026']

      strings.forEach(function(str) {
        it(`should measure '${str}' in parity with PDFKit`, function() {
          if (skip) {
            this.skip()
          }
          expect(quickMeasurer.widthOf(str)).to.be.closeTo(
            pdfKitMeasurer.widthOf(str),
            EPSILON_PIXELS
          )
        })
      })

      strings.forEach(function(str) {
        it(`should invoke the base when measuring '${str}'`, function() {
          if (skip) {
            this.skip()
          }
          quickMeasurer.widthOf(str)
          expect(pdfKitWidthOf).to.have.been.called
        })
      })
    })
  })
}

// i.e. Verdana
registerTests(defaults.font.path, !fs.existsSync(defaults.font.path))

// i.e. DejaVu Sans
registerTests(testHelpers.font.path)
