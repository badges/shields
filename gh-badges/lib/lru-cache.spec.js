'use strict'

const { expect } = require('chai')
const LRU = require('./lru-cache')

function expectCacheSlots(cache, keys) {
  expect(cache.cache.size).to.equal(keys.length)

  const slots = keys.map(k => cache.cache.get(k))

  const first = slots[0]
  const last = slots.slice(-1)[0]

  expect(cache.oldest).to.equal(first)
  expect(cache.newest).to.equal(last)

  expect(first.older).to.be.null
  expect(last.newer).to.be.null

  for (let i = 0; i + 1 < slots.length; ++i) {
    const current = slots[i]
    const next = slots[i + 1]
    expect(current.newer).to.equal(next)
    expect(next.older).to.equal(current)
  }
}

describe('The LRU cache', function() {
  it('should support a zero capacity', function() {
    const cache = new LRU(0)
    cache.set('key', 'value')
    expect(cache.cache.size).to.equal(0)
  })

  it('should support a one capacity', function() {
    const cache = new LRU(1)
    cache.set('key1', 'value1')
    expectCacheSlots(cache, ['key1'])
    cache.set('key2', 'value2')
    expectCacheSlots(cache, ['key2'])
    expect(cache.get('key1')).to.be.undefined
    expect(cache.get('key2')).to.equal('value2')
  })

  it('should remove the oldest element when reaching capacity', function() {
    const cache = new LRU(2)

    cache.set('key1', 'value1')
    cache.set('key2', 'value2')
    cache.set('key3', 'value3')
    cache.cache.get('key1')

    expectCacheSlots(cache, ['key2', 'key3'])
    expect(cache.cache.get('key1')).to.be.undefined
    expect(cache.get('key1')).to.be.undefined
    expect(cache.get('key2')).to.equal('value2')
    expect(cache.get('key3')).to.equal('value3')
  })

  it('should make sure that resetting a key in cache makes it newest', function() {
    const cache = new LRU(2)

    cache.set('key', 'value')
    cache.set('key2', 'value2')

    expectCacheSlots(cache, ['key', 'key2'])

    cache.set('key', 'value')

    expectCacheSlots(cache, ['key2', 'key'])
  })

  describe('getting a key in the cache', function() {
    context('when the requested key is oldest', function() {
      it('should leave the keys in the expected order', function() {
        const cache = new LRU(2)
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')

        expectCacheSlots(cache, ['key1', 'key2'])

        expect(cache.get('key1')).to.equal('value1')

        expectCacheSlots(cache, ['key2', 'key1'])
      })
    })

    context('when the requested key is newest', function() {
      it('should leave the keys in the expected order', function() {
        const cache = new LRU(2)
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')

        expect(cache.get('key2')).to.equal('value2')

        expectCacheSlots(cache, ['key1', 'key2'])
      })
    })

    context('when the requested key is in the middle', function() {
      it('should leave the keys in the expected order', function() {
        const cache = new LRU(3)
        cache.set('key1', 'value1')
        cache.set('key2', 'value2')
        cache.set('key3', 'value3')

        expectCacheSlots(cache, ['key1', 'key2', 'key3'])

        expect(cache.get('key2')).to.equal('value2')

        expectCacheSlots(cache, ['key1', 'key3', 'key2'])
      })
    })
  })

  it('should clear', function() {
    // Set up.
    const cache = new LRU(2)
    cache.set('key1', 'value1')
    cache.set('key2', 'value2')

    // Confidence check.
    expect(cache.get('key1')).to.equal('value1')
    expect(cache.get('key2')).to.equal('value2')

    // Run.
    cache.clear()

    // Test.
    expect(cache.get('key1')).to.be.undefined
    expect(cache.get('key2')).to.be.undefined
    expect(cache.cache.size).to.equal(0)
  })
})
