'use strict';

const PDFDocument = require('pdfkit');

class PDFKitTextMeasurer {
  constructor(fontPath, fallbackFontPath) {
    this.document = new PDFDocument({ size: 'A4', layout: 'landscape' })
      .fontSize(11);
    try {
      this.document.font(fontPath);
    } catch(e) {
      if (fallbackFontPath) {
        console.error(`Text-width computation may be incorrect. Unable to load font at ${fontPath}. Using fallback font ${fallbackFontPath} instead.`);
        this.document.font(fallbackFontPath);
      } else {
        console.error('No fallback font set.');
        throw e;
      }
    }
  }

  widthOf(str) {
    return this.document.widthOfString(str);
  }
}

class QuickTextMeasurer {
  constructor(fontPath, fallbackFontPath) {
    this.baseMeasurer = new PDFKitTextMeasurer(fontPath, fallbackFontPath)

    // This will be a Map of characters -> numbers.
    this.characterWidths = new Map();
    // This will be Map of Maps of characters -> numbers.
    this.kerningPairs = new Map();
    this._prepare();
  }

  static printableAsciiCharacters() {
    const printableRange = [32, 126];
    const length = printableRange[1] - printableRange[0] + 1;
    return Array
      .from({ length }, (value, i) => printableRange[0] + i)
      .map(charCode => String.fromCharCode(charCode));
  }

  _prepare() {
    const charactersToCache = this.constructor.printableAsciiCharacters();

    charactersToCache.forEach(char => {
      this.characterWidths.set(char, this.baseMeasurer.widthOf(char));
      this.kerningPairs.set(char, new Map());
    });

    charactersToCache.forEach(first => {
      charactersToCache.forEach(second => {
        const individually = this.characterWidths.get(first) + this.characterWidths.get(second);
        const asPair = this.baseMeasurer.widthOf(`${first}${second}`);
        const kerningAdjustment = asPair - individually;
        this.kerningPairs.get(first).set(second, kerningAdjustment);
      });
    });
  }

  widthOf(str) {
    const { characterWidths, kerningPairs } = this;

    let result = 0;
    let previous = null;
    for (const character of str) {
      if (!characterWidths.has(character)) {
        // Bail.
        return this.baseMeasurer.widthOf(str);
      }

      result += characterWidths.get(character);
      if (previous !== null) {
        result += kerningPairs.get(previous).get(character);
      }

      previous = character;
    }
    return result;
  }
}

module.exports = {
  PDFKitTextMeasurer,
  QuickTextMeasurer,
};
