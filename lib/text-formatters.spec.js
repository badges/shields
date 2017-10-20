'use strict';

const assert = require('assert');
const {
 maybePluralize,
 starRating
} = require('./text-formatters');

describe('text formatters', function() {
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
  
  it('should format star rating', function () {
    assert.equal(starRating(4.9), '★★★★★');
    assert.equal(starRating(3.7), '★★★¾☆');
    assert.equal(starRating(2.566), '★★½☆☆');
    assert.equal(starRating(2.2), '★★¼☆☆');
    assert.equal(starRating(3), '★★★☆☆');
  })
});
