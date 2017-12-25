'use strict';

const assert = require('assert');
const path = require('path');
const { makeBadgeData } = require('./badge-data');
const { makeBadge } = require('./make-badge');
const { PDFKitTextMeasurer } = require('./measure-text');
const { valueFromSvgBadge } = require('./svg-badge-parser');

const DEJAVU_PATH = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');

describe('The SVG badge parser', function() {
  it('should find the correct value', function() {
    const badgeData = makeBadgeData('this is the label', {});
    badgeData.text[1] = 'this is the result!';

    const measurer = new PDFKitTextMeasurer(DEJAVU_PATH);
    const exampleSvg = makeBadge(measurer, badgeData);

    assert.equal(valueFromSvgBadge(exampleSvg), 'this is the result!');
  });
});
