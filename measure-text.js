'use strict';

var path = require('path');
var fs = require('fs');
var PDFDocument = require('pdfkit');

var doc = (new PDFDocument({size:'A4', layout:'landscape'}));
try {
  doc = doc.font(path.join(__dirname, 'Verdana.ttf'));
} catch (ex) {
  doc = doc.font('Helvetica-Bold')
  console.warn('Could not load font file "Verdana.ttf", text widths will therefore be approximate', ex);
}
doc = doc.fontSize(11);

module.exports = measure;
function measure(str) {
  return doc.widthOfString(str);
}