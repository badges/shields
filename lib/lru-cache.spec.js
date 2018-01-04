'use strict';

const assert = require('assert');
const LRU = require('./lru-cache');

function expectCacheSlots(cache, slots) {
  assert.equal(cache.cache.size, slots.length);

  const first = slots[0];
  const last = slots.slice(-1)[0];

  assert.equal(cache.oldest, first);
  assert.equal(cache.newest, last);

  assert.equal(first.older, null);
  assert.equal(last.newer, null);

  for (let i = 0; i + 1 < slots.length; ++i) {
    const current = slots[i];
    const next = slots[i+1];
    assert.equal(current.newer, next);
    assert.equal(next.older, current);
  }
}

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
    const slot = cache.cache.get('key1');
    expectCacheSlots(cache, [slot]);
    cache.set('key2', 'value2');
    const slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot2]);
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
    expectCacheSlots(cache, [slot2, slot3]);
    assert.equal(cache.cache.get('key1'), undefined);
    assert.equal(cache.get('key1'), undefined);
    assert.equal(cache.get('key2'), 'value2');
    assert.equal(cache.get('key3'), 'value3');
  });

  it('should make sure that resetting a key in cache makes it newest', function () {
    const cache = new LRU(2);
    cache.set('key', 'value');
    cache.set('key2', 'value2');

    let slot1 = cache.cache.get('key');
    let slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot1, slot2]);
    cache.set('key', 'value');
    slot1 = cache.cache.get('key');
    slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot2, slot1]);
  });

  it('should make sure that getting a key in cache makes it newest', function () {
    let slot1, slot2, slot3, cache;

    // When the key is oldest.
    cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot1, slot2]);

    assert.equal(cache.get('key1'), 'value1');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot2, slot1]);

    // When the key is newest.
    cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    assert.equal(cache.get('key2'), 'value2');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot1, slot2]);

    // When the key is in the middle.
    cache = new LRU(3);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');
    cache.set('key3', 'value3');
    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    slot3 = cache.cache.get('key3');
    expectCacheSlots(cache, [slot1, slot2, slot3]);

    assert.equal(cache.get('key2'), 'value2');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    slot3 = cache.cache.get('key3');
    expectCacheSlots(cache, [slot1, slot3, slot2]);
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
