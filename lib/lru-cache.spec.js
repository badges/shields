'use strict';

const assert = require('assert');
const LRU = require('./lru-cache');

describe('The LRU cache', function () {
  it('should support being called without new', function () {
    const cache = LRU(1);
    assert(cache instanceof LRU);
  });

  it('should support a zero capacity', function () {
    const cache = new LRU(0);
    cache.set('key', 'value');
    assert.equal(cache.cache.size, 0);
  });

  it('should support a one capacity', function () {
    const cache = new LRU(1);
    cache.set('key1', 'value1');
    assert.equal(cache.cache.size, 1);
    assert.equal(cache.newest, cache.cache.get('key1'));
    assert.equal(cache.oldest, cache.cache.get('key1'));
    cache.set('key2', 'value2');
    assert.equal(cache.cache.size, 1);
    assert.equal(cache.newest, cache.cache.get('key2'));
    assert.equal(cache.oldest, cache.cache.get('key2'));
    assert.equal(cache.get('key1'), undefined);
    assert.equal(cache.get('key2'), 'value2');
  });

  it('should remove the oldest element when reaching capacity', function () {
    const cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    cache.cache.get('key1');
    const slot2 = cache.cache.get('key2');
    const slot3 = cache.cache.get('key3');
    assert.equal(cache.cache.size, 2);
    assert.equal(cache.oldest, slot2);
    assert.equal(cache.newest, slot3);
    assert.equal(slot2.older, null);
    assert.equal(slot2.newer, slot3);
    assert.equal(slot3.older, slot2);
    assert.equal(slot3.newer, null);
    assert.equal(cache.cache.get('key1'), undefined);
    assert.equal(cache.get('key1'), undefined);
    assert.equal(cache.get('key2'), 'value2');
    assert.equal(cache.get('key3'), 'value3');
  });

  it('should make sure that resetting a key in cache makes it newest', function () {
    const cache = new LRU(2);
    cache.set('key', 'value');
    cache.set('key2', 'value2');
    assert.equal(cache.oldest, cache.cache.get('key'));
    assert.equal(cache.newest, cache.cache.get('key2'));
    cache.set('key', 'value');
    assert.equal(cache.oldest, cache.cache.get('key2'));
    assert.equal(cache.newest, cache.cache.get('key'));
  });

  it('should make sure that getting a key in cache makes it newest', function () {
    let slot1, slot2, slot3, cache;

    // When the key is oldest.
    cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    assert.equal(cache.oldest, slot1);
    assert.equal(cache.newest, slot2);
    assert.equal(slot1.older, null);
    assert.equal(slot1.newer, slot2);
    assert.equal(slot2.older, slot1);
    assert.equal(slot2.newer, null);

    assert.equal(cache.get('key1'), 'value1');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    assert.equal(cache.oldest, slot2);
    assert.equal(cache.newest, slot1);
    assert.equal(slot2.older, null);
    assert.equal(slot2.newer, slot1);
    assert.equal(slot1.older, slot2);
    assert.equal(slot1.newer, null);


    // When the key is newest.
    cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    assert.equal(cache.get('key2'), 'value2');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    assert.equal(cache.oldest, slot1);
    assert.equal(cache.newest, slot2);
    assert.equal(slot1.older, null);
    assert.equal(slot1.newer, slot2);
    assert.equal(slot2.older, slot1);
    assert.equal(slot2.newer, null);

    // When the key is in the middle.
    cache = new LRU(3);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    slot3 = cache.cache.get('key3');
    assert.equal(cache.oldest, slot1);
    assert.equal(cache.newest, slot3);
    assert.equal(slot1.older, null);
    assert.equal(slot1.newer, slot2);
    assert.equal(slot2.older, slot1);
    assert.equal(slot2.newer, slot3);
    assert.equal(slot3.older, slot2);
    assert.equal(slot3.newer, null);

    assert.equal(cache.get('key2'), 'value2');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    slot3 = cache.cache.get('key3');
    assert.equal(cache.oldest, slot1);
    assert.equal(cache.newest, slot2);
    assert.equal(slot1.older, null);
    assert.equal(slot1.newer, slot3);
    assert.equal(slot3.older, slot1);
    assert.equal(slot3.newer, slot2);
    assert.equal(slot2.older, slot3);
    assert.equal(slot2.newer, null);
  });

  it('should clear', function () {
    // Set up.
    const cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    // Confidence check.
    assert.equal(cache.get('key1'), 'value1');
    assert.equal(cache.get('key2'), 'value2');

    // Run.
    cache.clear();

    // Test.
    assert.equal(cache.get('key1'), null);
    assert.equal(cache.get('key2'), null);
    assert.equal(cache.cache.size, 0);
  });
});
