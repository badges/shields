'use strict';

const PDFDocument = require('pdfkit');

class PDFKitTextMeasurer {
  constructor() {
    this.document = new PDFDocument({ size: 'A4', layout: 'landscape' })
      .fontSize(11);
  }

  useFont(fontPath) {
    return new Promise((resolve, reject) => {
      try {
        this.document.font(fontPath);
      } catch (e) {
        reject(e);
        return;
      }
      resolve(this);
    });
  }

  widthOf(str) {
    return this.document.widthOfString(str);
  }

  static create(fontPath, fallbackFontPath) {
    return new this().useFont(fontPath)
      .catch(err => {
        if (fallbackFontPath) {
          console.log(`Unable to load font at ${fontPath}. Trying fallback font ${fallbackFontPath}.`);
          return new this().useFont(fallbackFontPath);
        } else {
          throw err;
        }
      });
  }
}

class QuickTextMeasurer {
  constructor(baseMeasurer) {
    Object.assign(this, { baseMeasurer });

    // This will be a Map of characters -> numbers.
    this.characterWidths = new Map();
    // This will be Map of Maps of characters -> numbers.
    this.kerningPairs = new Map();
  }

  static create(fontPath, fallbackFontPath) {
    return PDFKitTextMeasurer.create(fontPath, fallbackFontPath)
      .then(pdfKitMeasurer => {
        const result = new this(pdfKitMeasurer);
        result.prepare();
        return result;
      });
  }

  static printableAsciiCharacters() {
    const printableRange = [32, 126];
    const length = printableRange[1] - printableRange[0] + 1;
    return Array
      .from({ length }, (value, i) => printableRange[0] + i)
      .map(charCode => String.fromCharCode(charCode));
  }

  prepare() {
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

// const defaultMeasurer = new TextMeasurer();
// whenReady.then(() => defaultMeasurer.prepare());

module.exports = {
  PDFKitTextMeasurer,
  QuickTextMeasurer,
  // measure: defaultMeasurer.measure.bind(defaultMeasurer),
};
