'use strict'

// In-memory KV, remove the oldest data when the capacity is reached.

const typeEnum = {
  unit: 0,
  heap: 1,
}

// In bytes.
let heapSize
function computeHeapSize() {
  return (heapSize = process.memoryUsage().heapTotal)
}

let heapSizeTimeout
function getHeapSize() {
  if (heapSizeTimeout == null) {
    // Compute the heap size every 60 seconds.
    heapSizeTimeout = setInterval(computeHeapSize, 60 * 1000)
    return computeHeapSize()
  } else {
    return heapSize
  }
}

function CacheSlot(key, value) {
  this.key = key
  this.value = value
  this.older = null // Newest slot that is older than this slot.
  this.newer = null // Oldest slot that is newer than this slot.
}

function Cache(capacity, type) {
  type = type || 'unit'
  this.capacity = capacity
  this.type = typeEnum[type]
  this.cache = new Map() // Maps cache keys to CacheSlots.
  this.newest = null // Newest slot in the cache.
  this.oldest = null
}

Cache.prototype = {
  set: function addToCache(cacheKey, cached) {
    let slot = this.cache.get(cacheKey)
    if (slot === undefined) {
      slot = new CacheSlot(cacheKey, cached)
      this.cache.set(cacheKey, slot)
    }
    this.makeNewest(slot)
    const numItemsToRemove = this.limitReached()
    if (numItemsToRemove > 0) {
      for (let i = 0; i < numItemsToRemove; i++) {
        this.removeOldest()
      }
    }
  },

  get: function getFromCache(cacheKey) {
    const slot = this.cache.get(cacheKey)
    if (slot !== undefined) {
      this.makeNewest(slot)
      return slot.value
    }
  },

  has: function hasInCache(cacheKey) {
    return this.cache.has(cacheKey)
  },

  makeNewest: function makeNewestSlot(slot) {
    const previousNewest = this.newest
    if (previousNewest === slot) {
      return
    }
    const older = slot.older
    const newer = slot.newer

    if (older !== null) {
      older.newer = newer
    } else if (newer !== null) {
      this.oldest = newer
    }
    if (newer !== null) {
      newer.older = older
    }
    this.newest = slot

    if (previousNewest !== null) {
      slot.older = previousNewest
      slot.newer = null
      previousNewest.newer = slot
    } else {
      // If previousNewest is null, the cache used to be empty.
      this.oldest = slot
    }
  },

  removeOldest: function removeOldest() {
    const cacheKey = this.oldest.key
    if (this.oldest !== null) {
      this.oldest = this.oldest.newer
      if (this.oldest !== null) {
        this.oldest.older = null
      }
    }
    this.cache.delete(cacheKey)
  },

  // Returns the number of elements to remove if we're past the limit.
  limitReached: function heuristic() {
    if (this.type === typeEnum.unit) {
      // Remove the excess.
      return Math.max(0, this.cache.size - this.capacity)
    } else if (this.type === typeEnum.heap) {
      if (getHeapSize() >= this.capacity) {
        console.log('LRU HEURISTIC heap:', getHeapSize())
        // Remove half of them.
        return this.cache.size >> 1
      } else {
        return 0
      }
    } else {
      console.error(`Unknown heuristic '${this.type}' for LRU cache.`)
      return 1
    }
  },

  clear: function() {
    this.cache.clear()
    this.newest = null
    this.oldest = null
  },
}

module.exports = Cache
