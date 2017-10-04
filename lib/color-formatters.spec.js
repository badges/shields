'use strict';

const assert = require('assert');
const {
  coveragePercentage,
  colorScale,
  age
} = require('./color-formatters');

describe('Color formatters', function() {
  it('should step appropriately', function() {
    const byPercentage = colorScale([Number.EPSILON, 80, 90, 100]);
    assert.equal(byPercentage(-1), 'red');
    assert.equal(byPercentage(0), 'red');
    assert.equal(byPercentage(0.5), 'yellow');
    assert.equal(byPercentage(1), 'yellow');
    assert.equal(byPercentage(50), 'yellow');
    assert.equal(byPercentage(80), 'yellowgreen');
    assert.equal(byPercentage(85), 'yellowgreen');
    assert.equal(byPercentage(90), 'green');
    assert.equal(byPercentage(100), 'brightgreen');
    assert.equal(byPercentage(101), 'brightgreen');
  });

  it('should have parity with coveragePercentage', function() {
    const byPercentage = colorScale([Number.EPSILON, 80, 90, 100]);
    assert.equal(byPercentage(-1), coveragePercentage(-1));
    assert.equal(byPercentage(0), coveragePercentage(0));
    assert.equal(byPercentage(0.5), coveragePercentage(0.5));
    assert.equal(byPercentage(1), coveragePercentage(1));
    assert.equal(byPercentage(50), coveragePercentage(50));
    assert.equal(byPercentage(80), coveragePercentage(80));
    assert.equal(byPercentage(85), coveragePercentage(85));
    assert.equal(byPercentage(90), coveragePercentage(90));
    assert.equal(byPercentage(100), coveragePercentage(100));
    assert.equal(byPercentage(101), coveragePercentage(101));
  });

  it('should step in reverse', function() {
    const byAge = colorScale([7, 30, 180, 365, 730], undefined, true);
    assert.equal(byAge(3), 'brightgreen');
    assert.equal(byAge(7), 'green');
    assert.equal(byAge(10), 'green');
    assert.equal(byAge(60), 'yellowgreen');
    assert.equal(byAge(250), 'yellow');
    assert.equal(byAge(400), 'orange');
    assert.equal(byAge(800), 'red');
  });

  it('should generate correct color for ages', function() {
    const monthsAgo = months => {
      const result = new Date();
      // This looks wack but it works.
      result.setMonth(result.getMonth() - months);
      return result;
    };

    assert.equal(age(Date.now()), 'brightgreen');
    assert.equal(age(new Date()), 'brightgreen');
    assert.equal(age(new Date(2001, 1, 1)), 'red');
    assert.equal(age(monthsAgo(2)), 'yellowgreen');
    assert.equal(age(monthsAgo(15)), 'orange');
  });
});
