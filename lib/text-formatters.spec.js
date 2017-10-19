'use strict';

const assert = require('assert');
const moment = require('moment');
const {
  starRating,
  currencyFromCode,
  ordinalNumber,
  metric,
  omitv,
  maybePluralize,
  formatDate
} = require('./text-formatters');

describe('text formatters', function() {
  it('should format star rating', function () {
    assert.equal(starRating(4.9), '★★★★★');
    assert.equal(starRating(3.7), '★★★¾☆');
    assert.equal(starRating(2.566), '★★½☆☆');
    assert.equal(starRating(2.2), '★★¼☆☆');
    assert.equal(starRating(3), '★★★☆☆');
  });

  it('should format currency from code', function() {
    assert.equal(currencyFromCode('CNY'), '¥');
    assert.equal(currencyFromCode('EUR'), '€');
    assert.equal(currencyFromCode('GBP'), '₤');
    assert.equal(currencyFromCode('USD'), '$');
    assert.equal(currencyFromCode('AUD'), 'AUD');
  });

  it('should format ordinal number', function() {
    assert.equal(ordinalNumber(2), '2ⁿᵈ');
    assert.equal(ordinalNumber(11), '11ᵗʰ');
    assert.equal(ordinalNumber(23), '23ʳᵈ');
    assert.equal(ordinalNumber(131), '131ˢᵗ');
  });

  it('should format metric', function() {
    assert.equal(metric(3), '3');
    assert.equal(metric(998999), '999k');
    assert.equal(metric(5000000), '5M');
    assert.equal(metric(1578896212), '2G');
    assert.equal(metric(80000000000000), '80T');
    assert.equal(metric(4000000000000001), '4P');
    assert.equal(metric(71007000100580002000), '71E');
    assert.equal(metric(1000000000000000000000), '1Z');
    assert.equal(metric(2222222222222222222222222), '2Y');
  });

  it('should omit leading v characters', function() {
    assert.equal(omitv('hello'), 'hello');
    assert.equal(omitv('v1.0.1'), '1.0.1');
  });

  it('should pluralize', function() {
    assert.equal(maybePluralize('foo', []), 'foos');
    assert.equal(maybePluralize('foo', [123]), 'foo');
    assert.equal(maybePluralize('foo', [123, 456]), 'foos');
    assert.equal(maybePluralize('foo', undefined), 'foos');

    assert.equal(maybePluralize('box', [], 'boxes'), 'boxes');
    assert.equal(maybePluralize('box', [123], 'boxes'), 'box');
    assert.equal(maybePluralize('box', [123, 456], 'boxes'), 'boxes');
    assert.equal(maybePluralize('box', undefined, 'boxes'), 'boxes');
  });

  it('should format date', function() {
    assert.equal(formatDate(1465513200000), 'june 2016');
    assert.equal(formatDate(moment().startOf('year')), 'january');
  });
});
