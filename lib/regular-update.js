'use strict';

const request = require('request');

// Map from URL to { timestamp: last fetch time, interval: in milliseconds,
// data: data }.
const regularUpdateCache = new Map();

// url: a string, scraper: a function that takes string data at that URL.
// interval: number in milliseconds.
// cb: a callback function that takes an error and data returned by the scraper.
function regularUpdate(url, interval, scraper, cb) {
  const timestamp = Date.now();
  const cache = regularUpdateCache.get(url);
  if (cache != null &&
      (timestamp - cache.timestamp) < interval) {
    cb(null, regularUpdateCache.get(url).data);
    return;
  }
  request(url, function(err, res, buffer) {
    if (err != null) { cb(err); return; }
    if (regularUpdateCache.has(url)) {
      regularUpdateCache.set(url, { timestamp: 0, data: 0 });
    }
    let data;
    try {
      data = scraper(buffer);
    } catch(e) { cb(e); return; }
    regularUpdateCache.get(url).timestamp = timestamp;
    regularUpdateCache.get(url).data = data;
    cb(null, data);
  });
}

function clearRegularUpdateCache() {
  regularUpdate.clear();
}

module.exports = {
  regularUpdate,
  clearRegularUpdateCache
};
