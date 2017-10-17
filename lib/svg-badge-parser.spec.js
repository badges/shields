'use strict';

const assert = require('assert');
const { makeBadgeData } = require('./badge-data');
const badge = require('./badge');
const { valueFromSvgBadge } = require('./svg-badge-parser');

describe('The SVG badge parser', function() {
  let exampleSvg;
  beforeEach(function (done) {
    const badgeData = makeBadgeData('this is the label', {});
    badgeData.text[1] = 'this is the result!';

    badge(badgeData, (svg, err) => {
      assert(! err);
      exampleSvg = svg;
      done();
    });
  });

  it('should find the correct value', function() {
    assert.equal(valueFromSvgBadge(exampleSvg), 'this is the result!');
  });
});
