'use strict'

const PDFDocument = require('pdfkit')
const anafanafo = require('anafanafo')

class PDFKitTextMeasurer {
  constructor(fontPath, fallbackFontPath) {
    this.document = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
    }).fontSize(11)
    try {
      this.document.font(fontPath)
    } catch (e) {
      if (fallbackFontPath) {
        console.error(
          `Text-width computation may be incorrect. Unable to load font at ${fontPath}. Using fallback font ${fallbackFontPath} instead.`
        )
        this.document.font(fallbackFontPath)
      } else {
        console.error('No fallback font set.')
        throw e
      }
    }
  }

  widthOf(str) {
    return this.document.widthOfString(str)
  }
}

class QuickTextMeasurer {
  widthOf(str) {
    return anafanafo(str) / 10.0
  }
}

module.exports = {
  PDFKitTextMeasurer,
  QuickTextMeasurer,
}
