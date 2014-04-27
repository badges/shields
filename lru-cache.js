// Cache any data with a timestamp,
// remove only the oldest data.

function Cache(size) {
  if (!this instanceof Cache) { return new Cache(size); }
  this.size = size;
  this.cache = Object.create(null);
  this.cacheTime = Object.create(null);
  this.cacheSize = 0;
}

Cache.prototype.set =
function addToCache(cacheIndex, cached) {
  this.cache[cacheIndex] = cached;
  var mostAncient = +(new Date());
  this.cacheTime[cacheIndex] = mostAncient;
  if (this.cacheSize >= this.size) {
    // Find the most ancient image.
    var ancientCacheIndex = cacheIndex;
    for (var currentCacheIndex in this.cacheTime) {
      if (mostAncient > this.cacheTime[currentCacheIndex]) {
        mostAncient = this.cacheTime[currentCacheIndex];
        ancientCacheIndex = currentCacheIndex;
      }
    }
    // Delete that image.
    delete this.cache[ancientCacheIndex];
    delete this.cacheTime[ancientCacheIndex];
  } else {
    this.cacheSize++;
  }
}

Cache.prototype.get =
function getFromCache(cacheIndex) {
  this.cacheTime[cacheIndex] = +(new Date());
  return this.cache[cacheIndex];
}

Cache.prototype.has =
function hasInCache(cacheIndex) {
  return this.cache[cacheIndex] !== undefined;
}

module.exports = Cache;
