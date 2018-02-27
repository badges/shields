'use strict';

const { expect } = require('chai');
const { makeBadgeData } = require('./badge-data');
const { valueFromSvgBadge } = require('./svg-badge-parser');
const testHelpers = require('./make-badge-test-helpers');

const makeBadge = testHelpers.makeBadge();

describe('The SVG badge parser', function() {
  it('should find the correct value', function() {
    const badgeData = makeBadgeData('this is the label', {});
    badgeData.text[1] = 'this is the result!';

    const exampleSvg = makeBadge(badgeData);

    expect(valueFromSvgBadge(exampleSvg)).to.equal('this is the result!');
  });
});
