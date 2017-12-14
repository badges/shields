'use strict';

const request = require('request');

// Map from URL to { timestamp: last fetch time, interval: in milliseconds,
// data: data }.
let regularUpdateCache = Object.create(null);

// url: a string, scraper: a function that takes string data at that URL.
// interval: number in milliseconds.
// cb: a callback function that takes an error and data returned by the scraper.
function regularUpdate(url, interval, scraper, cb, options) {
  const timestamp = Date.now();
  const cache = regularUpdateCache[url];
  if (cache != null &&
      (timestamp - cache.timestamp) < interval) {
    cb(null, regularUpdateCache[url].data);
    return;
  }
  request(url, options || {}, function(err, res, buffer) {
    if (err != null) { cb(err); return; }
    if (regularUpdateCache[url] == null) {
      regularUpdateCache[url] = { timestamp: 0, data: 0 };
    }
    let data;
    try {
      data = scraper(buffer);
    } catch(e) { cb(e); return; }
    regularUpdateCache[url].timestamp = timestamp;
    regularUpdateCache[url].data = data;
    cb(null, data);
  });
}

function clearRegularUpdateCache() {
  regularUpdateCache = Object.create(null);
}

module.exports = {
  regularUpdate,
  clearRegularUpdateCache
};
