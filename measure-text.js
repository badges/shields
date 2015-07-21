'use strict';

var path = require('path');
var PDFDocument = require('pdfkit');

var doc = (new PDFDocument({size:'A4', layout:'landscape'}))
  .font(path.join(__dirname, 'Verdana.ttf'))
  .fontSize(11);

module.exports = measure;
function measure(str) {
  return doc.widthOfString(str);
}