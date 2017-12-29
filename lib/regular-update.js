'use strict';

// Map from URL to { timestamp: last fetch time, data: data }.
let regularUpdateCache = Object.create(null);

// url: a string, scraper: a function that takes string data at that URL.
// interval: number in milliseconds.
// cb: a callback function that takes an error and data returned by the scraper.
function regularUpdate({
  url,
  intervalMillis,
  json = true,
  scraper = buffer => buffer,
  options = {},
  request = require('request'),
}, cb) {
  const timestamp = Date.now();
  const cached = regularUpdateCache[url];
  if (cached != null &&
      (timestamp - cached.timestamp) < intervalMillis) {
    cb(null, cached.data);
    return;
  }
  request(url, options, (err, res, buffer) => {
    if (err != null) { cb(err); return; }

    let reqData;
    if (json) {
      try {
        reqData = JSON.parse(buffer);
      } catch(e) { cb(e); return; }
    } else {
      reqData = buffer;
    }

    let data;
    try {
      data = scraper(reqData);
    } catch(e) { cb(e); return; }

    regularUpdateCache[url] = { timestamp, data };
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
