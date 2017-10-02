'use strict';

const assert = require('assert');
const path = require('path');
const measureText = require('./measure-text');

describe('The text measurer', function () {
  it('should produce the same length as before', function (done) {
    const fontPath = path.join(__dirname, '..', 'node_modules', 'dejavu-fonts-ttf', 'ttf', 'DejaVuSans.ttf');

    measureText.loadFont(fontPath, err => {
      assert.ok(err === null);

      const actual = measureText('This is the dawning of the Age of Aquariums');
      const expected = 243.546875;
      assert.equal(actual, expected);

      done();
    });
  });
});
