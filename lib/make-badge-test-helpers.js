'use strict';

const path = require('path');
const { PDFKitTextMeasurer } = require('./text-measurer');
const { makeMakeBadgeFn } = require('./make-badge');

module.exports = {
  font: {
    path: path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf'),
  },
  measurer() {
    return new PDFKitTextMeasurer(this.font.path);
  },
  makeBadge() {
    return makeMakeBadgeFn(this.measurer());
  },
};
