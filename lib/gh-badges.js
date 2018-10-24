'use strict'

const { makeBadge } = require('./make-badge')
const { PDFKitTextMeasurer, QuickTextMeasurer } = require('./text-measurer')

class BadgeFactory {
  constructor({ fontPath, fallbackFontPath, cache = true }) {
    this.measurer = cache
      ? new QuickTextMeasurer(fontPath, fallbackFontPath)
      : new PDFKitTextMeasurer(fontPath, fallbackFontPath)
  }

  create(format) {
    return makeBadge(this.measurer, format)
  }
}

module.exports = {
  BadgeFactory,
}
