'use strict';

const { expect } = require('chai');
const LRU = require('./lru-cache');

function expectCacheSlots(cache, slots) {
  expect(cache.cache.size).to.equal(slots.length);

  const first = slots[0];
  const last = slots.slice(-1)[0];

  expect(cache.oldest).to.equal(first);
  expect(cache.newest).to.equal(last);

  expect(first.older).to.be.null;
  expect(last.newer).to.be.null;

  for (let i = 0; i + 1 < slots.length; ++i) {
    const current = slots[i];
    const next = slots[i+1];
    expect(current.newer).to.equal(next);
    expect(next.older).to.equal(current);
  }
}

describe('The LRU cache', function () {
  it('should support being called without new', function () {
    const cache = LRU(1);
    expect(cache).to.be.an.instanceof(LRU);
  });

  it('should support a zero capacity', function () {
    const cache = new LRU(0);
    cache.set('key', 'value');
    expect(cache.cache.size).to.equal(0);
  });

  it('should support a one capacity', function () {
    const cache = new LRU(1);
    cache.set('key1', 'value1');
    expect(cache.cache.size).to.equal(1);
    expect(cache.newest).to.equal(cache.cache.get('key1'));
    expect(cache.oldest).to.equal(cache.cache.get('key1'));
    cache.set('key2', 'value2');
    const slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot2]);
    expect(cache.get('key1')).to.be.undefined;
    expect(cache.get('key2')).to.equal('value2');
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
    expect(cache.cache.get('key1')).to.be.undefined;
    expect(cache.get('key1')).to.be.undefined;
    expect(cache.get('key2')).to.equal('value2');
    expect(cache.get('key3')).to.equal('value3');
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

    expect(cache.get('key1')).to.equal('value1');

    slot1 = cache.cache.get('key1');
    slot2 = cache.cache.get('key2');
    expectCacheSlots(cache, [slot2, slot1]);

    // When the key is newest.
    cache = new LRU(2);
    cache.set('key1', 'value1');
    cache.set('key2', 'value2');

    expect(cache.get('key2')).to.equal('value2');

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

    expect(cache.get('key2')).to.equal('value2');

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
    expect(cache.get('key1')).to.equal('value1');
    expect(cache.get('key2')).to.equal('value2');

    // Run.
    cache.clear();

    // Test.
    expect(cache.get('key1')).to.be.undefined;
    expect(cache.get('key2')).to.be.undefined;
    expect(cache.cache.size).to.equal(0);
  });
});
