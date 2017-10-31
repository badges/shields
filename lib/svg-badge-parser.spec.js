'use strict';

const assert = require('assert');
const { makeBadgeData } = require('./badge-data');
const makeBadge = require('./make-badge');
const { valueFromSvgBadge } = require('./svg-badge-parser');

describe('The SVG badge parser', function() {
  it('should find the correct value', function() {
    const badgeData = makeBadgeData('this is the label', {});
    badgeData.text[1] = 'this is the result!';
    const exampleSvg = makeBadge(badgeData);

    assert.equal(valueFromSvgBadge(exampleSvg), 'this is the result!');
  });
});
