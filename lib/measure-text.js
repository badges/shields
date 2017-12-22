'use strict';

const path = require('path');
const PDFDocument = require('pdfkit');
let doc = new PDFDocument({size: 'A4', layout: 'landscape'});

// Attempt to use a particular font.
// callback: (optional) takes an error if it failed.
function loadFont(path, callback) {
  try {
    doc = doc.font(path);
    if (callback) { callback(null); }
  } catch(err) {
    doc = doc.font('Helvetica-Bold');
    if (callback) { callback(err); }
  }
}

const whenReady = new Promise((resolve, reject) => {
  loadFont(path.join(__dirname, '..', 'Verdana.ttf'), function (err) {
    if (err && process.env.FALLBACK_FONT_PATH) {
      loadFont(process.env.FALLBACK_FONT_PATH, function (err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    } else {
      resolve();
    }
  });
  doc = doc.fontSize(11);
});

function measure(str) {
  return doc.widthOfString(str);
}

class TextMeasurer {
  constructor() {
    // This will be a Map of characters -> numbers.
    this.characterWidths = new Map();
    // This will be Map of Maps of characters -> numbers.
    this.kerningPairs = new Map();
  }

  static printableAsciiCharacters() {
    const printableRange = [32, 126];
    const length = printableRange[1] - printableRange[0] + 1;
    return Array
      .from({ length }, (value, i) => printableRange[0] + i)
      .map(charCode => String.fromCharCode(charCode));
  }

  static rawMeasure(str) {
    return measure(str);
  }

  prepare() {
    const charactersToCache = this.constructor.printableAsciiCharacters();

    charactersToCache.forEach(char => {
      this.characterWidths.set(char, this.constructor.rawMeasure(char));
      this.kerningPairs.set(char, new Map());
    });

    charactersToCache.forEach(first => {
      charactersToCache.forEach(second => {
        const individually = this.characterWidths.get(first) + this.characterWidths.get(second);
        const asPair = this.constructor.rawMeasure(`${first}${second}`);
        const kerningAdjustment = asPair - individually;
        this.kerningPairs.get(first).set(second, kerningAdjustment);
      });
    });
  }

  measure(str) {
    const { characterWidths, kerningPairs } = this;

    let result = 0;
    let previous = null;
    for (const character of str) {
      if (!characterWidths.has(character)) {
        // Bail.
        return this.constructor.rawMeasure(str);
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

const defaultMeasurer = new TextMeasurer();
whenReady.then(() => defaultMeasurer.prepare());

module.exports = {
  loadFont,
  whenReady,
  TextMeasurer,
  measure: defaultMeasurer.measure.bind(defaultMeasurer),
};
