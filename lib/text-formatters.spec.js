'use strict';

const assert = require('assert');
const {
 maybePluralize
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
});
