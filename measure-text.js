'use strict';

var path = require('path');
var fs = require('fs');
var PDFDocument = require('pdfkit');
var doc = new PDFDocument({size:'A4', layout:'landscape'});

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

loadFont(path.join(__dirname, 'Verdana.ttf'));
doc = doc.fontSize(11);

function measure(str) {
  return doc.widthOfString(str);
}

module.exports = measure;
module.exports.loadFont = loadFont;
