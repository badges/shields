// Cache any data with a timestamp,
// remove only the oldest data.

var typeEnum = {
  unit: 0,
  heap: 1,
};

function Cache(size, type) {
  if (!this instanceof Cache) { return new Cache(size, type); }
  type = type || 'unit';
  this.size = size;
  this.type = typeEnum[type];
  // `cache` contains {content, index}.
  // - content: the actual data that is cached.
  // - index: the position in `order` of the data.
  this.cache = Object.create(null);
  this.order = [];  // list of cache keys from oldest to newest.
}

Cache.prototype = {
  set: function addToCache(cacheIndex, cached) {
    if (this.cache[cacheIndex] !== undefined) {
      this.order.splice(this.cache[cacheIndex].index, 1);
      // Put the new element at the end of `order`.
      this.cache[cacheIndex].index = this.order.length;
      this.cache[cacheIndex].content = cached;
      this.order.push(cacheIndex);
    } else {
      // If the cache is full, remove the oldest data
      // (ie, the data requested longest ago.)
      var numberToRemove = this.limitReached();
      for (var i = 0; i < numberToRemove; i++) {
        // Remove `order`'s oldest element, the first.
        delete this.cache[this.order[0]];
        this.order.shift();
      }

      this.cache[cacheIndex] = {
        index: this.order.length,
        content: cached,
      }
      this.order.push(cacheIndex);
    }
  },

  get: function getFromCache(cacheIndex) {
    if (this.cache[cacheIndex] !== undefined) {
      this.order.splice(this.cache[cacheIndex].index, 1);
      // Put the new element at the end of `order`.
      this.cache[cacheIndex].index = this.order.length;
      this.order.push(cacheIndex);
      return this.cache[cacheIndex].content;
    } else { return; }
  },

  has: function hasInCache(cacheIndex) {
    return this.cache[cacheIndex] !== undefined;
  },

  // Returns true if we're past the limit.
  limitReached: function heuristic() {
    if (this.type === typeEnum.unit) {
      return Math.max(0, (this.order.length - this.size));
    } else if (this.type === typeEnum.heap) {
      if (getHeapSize() >= this.size) {
        console.log('LRU HEURISTIC heap:', getHeapSize());
        // Remove half of them.
        return (this.order.length >> 1);
      } else { return 0; }
    } else {
      console.error("Unknown heuristic '" + this.type + "' for LRU cache.");
      return 1;
    }
  },
};

// In bytes.
var heapSize;
var heapSizeTimeout;
function getHeapSize() {
  if (heapSizeTimeout == null) {
    // Compute the heap size every 60 seconds.
    heapSizeTimeout = setInterval(computeHeapSize, 60 * 1000);
    return computeHeapSize();
  } else {
    return heapSize;
  }
}
function computeHeapSize() {
  return heapSize = process.memoryUsage().heapTotal;
}

module.exports = Cache;
