// Cache any data with a timestamp,
// remove only the oldest data.

function Cache(size) {
  if (!this instanceof Cache) { return new Cache(size); }
  this.size = size;
  // `cache` contains {content, index}.
  // - content: the actual data that is cached.
  // - index: the position in `order` of the data.
  this.cache = Object.create(null);
  this.order = [];  // list of cache keys from oldest to newest.
}

Cache.prototype.set =
function addToCache(cacheIndex, cached) {
  if (this.cache[cacheIndex] !== undefined) {
    this.order.splice(this.cache[cacheIndex].index, 1);
    // Put the new element at the end of `order`.
    this.cache[cacheIndex].index = this.order.length;
    this.cache[cacheIndex].content = cached;
    this.order.push(cacheIndex);
  } else {
    // If the cache is full, remove the oldest data
    // (ie, the data requested longest ago.)
    if (this.order.length >= this.size) {
      // Remove `order`'s oldest element, the first.
      delete this.cache[this.order[0]];
      this.order.shift();
    }

    this.cache[cacheIndex] = {
      index: this.order.length,
      content: cached
    }
    this.order.push(cacheIndex);
  }
}

Cache.prototype.get =
function getFromCache(cacheIndex) {
  if (this.cache[cacheIndex] !== undefined) {
    this.order.splice(this.cache[cacheIndex].index, 1);
    // Put the new element at the end of `order`.
    this.cache[cacheIndex].index = this.order.length;
    this.order.push(cacheIndex);
    return this.cache[cacheIndex].content;
  } else { return; }
}

Cache.prototype.has =
function hasInCache(cacheIndex) {
  return this.cache[cacheIndex] !== undefined;
}

module.exports = Cache;
