'use strict';

// eslint-disable-next-line node/no-deprecated-api
const domain = require('domain');
const request = require('request');
const badge = require('./badge');
const {
  makeBadgeData: getBadgeData
} = require('./badge-data');
const log = require('./log');
const LruCache = require('./lru-cache');
const {
  incrMonthlyAnalytics,
  getAnalytics
} = require('./analytics');
const {
  makeSend
} = require('./result-sender');

// We avoid calling the vendor's server for computation of the information in a
// number of badges.
const minAccuracy = 0.75;

// The quotient of (vendor) data change frequency by badge request frequency
// must be lower than this to trigger sending the cached data *before*
// updating our data from the vendor's server.
// Indeed, the accuracy of our badges are:
// A(Δt) = 1 - min(# data change over Δt, # requests over Δt)
//             / (# requests over Δt)
//       = 1 - max(1, df) / rf
const freqRatioMax = 1 - minAccuracy;

// Request cache size of 5MB (~5000 bytes/image).
const requestCache = new LruCache(1000);

// Deep error handling for vendor hooks.
const vendorDomain = domain.create();
vendorDomain.on('error', function(err) {
  log.error('Vendor hook error:', err.stack);
});

function handleRequest (vendorRequestHandler) {
  return function getRequest(data, match, end, ask) {
    if (data.maxAge !== undefined && /^[0-9]+$/.test(data.maxAge)) {
      ask.res.setHeader('Cache-Control', 'max-age=' + data.maxAge);
    } else {
      // Cache management - no cache, so it won't be cached by GitHub's CDN.
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }
    const reqTime = new Date();
    const date = (reqTime).toGMTString();
    ask.res.setHeader('Expires', date);  // Proxies, GitHub, see #221.
    ask.res.setHeader('Date', date);
    incrMonthlyAnalytics(getAnalytics().vendorMonthly);
    if (data.style === 'flat') {
      incrMonthlyAnalytics(getAnalytics().vendorFlatMonthly);
    } else if (data.style === 'flat-square') {
      incrMonthlyAnalytics(getAnalytics().vendorFlatSquareMonthly);
    }

    const cacheIndex = match[0] + '?label=' + data.label + '&style=' + data.style
      + '&logo=' + data.logo + '&logoWidth=' + data.logoWidth
      + '&link=' + JSON.stringify(data.link) + '&colorA=' + data.colorA
      + '&colorB=' + data.colorB;
    // Should we return the data right away?
    const cached = requestCache.get(cacheIndex);
    let cachedVersionSent = false;
    if (cached !== undefined) {
      // A request was made not long ago.
      const tooSoon = (+reqTime - cached.time) < cached.interval;
      if (tooSoon || (cached.dataChange / cached.reqs <= freqRatioMax)) {
        badge(cached.data.badgeData, makeSend(cached.data.format, ask.res, end));
        cachedVersionSent = true;
        // We do not wish to call the vendor servers.
        if (tooSoon) { return; }
      }
    }

    // In case our vendor servers are unresponsive.
    let serverUnresponsive = false;
    const serverResponsive = setTimeout(function() {
      serverUnresponsive = true;
      if (cachedVersionSent) { return; }
      if (requestCache.has(cacheIndex)) {
        const cached = requestCache.get(cacheIndex).data;
        badge(cached.badgeData, makeSend(cached.format, ask.res, end));
        return;
      }
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const badgeData = getBadgeData('vendor', data);
      badgeData.text[1] = 'unresponsive';
      let extension;
      try {
        extension = match[0].split('.').pop();
      } catch(e) { extension = 'svg'; }
      badge(badgeData, makeSend(extension, ask.res, end));
    }, 25000);

    // Only call vendor servers when last request is older than…
    let cacheInterval = 5000;  // milliseconds
    function cachingRequest (uri, options, callback) {
      if ((typeof options === 'function') && !callback) { callback = options; }
      if (options && typeof options === 'object') {
        options.uri = uri;
      } else if (typeof uri === 'string') {
        options = {uri: uri};
      } else {
        options = uri;
      }
      options.headers = options.headers || {};
      options.headers['User-Agent'] = options.headers['User-Agent'] || 'Shields.io';
      return request(options, function(err, res, body) {
        if (res != null && res.headers != null) {
          const cacheControl = res.headers['cache-control'];
          if (cacheControl != null) {
            const age = cacheControl.match(/max-age=([0-9]+)/);
            if ((age != null) && (+age[1] === +age[1])) {
              cacheInterval = +age[1] * 1000;
            }
          }
        }
        callback(err, res, body);
      });
    }

    vendorDomain.run(function() {
      vendorRequestHandler(data, match, function sendBadge(format, badgeData) {
        if (serverUnresponsive) { return; }
        clearTimeout(serverResponsive);
        // Check for a change in the data.
        let dataHasChanged = false;
        if (cached !== undefined
          && cached.data.badgeData.text[1] !== badgeData.text[1]) {
          dataHasChanged = true;
        }
        // Add format to badge data.
        badgeData.format = format;
        // Update information in the cache.
        const updatedCache = {
          reqs: cached? (cached.reqs + 1): 1,
          dataChange: cached? (cached.dataChange + (dataHasChanged? 1: 0))
                            : 1,
          time: +reqTime,
          interval: cacheInterval,
          data: { format: format, badgeData: badgeData }
        };
        requestCache.set(cacheIndex, updatedCache);
        if (!cachedVersionSent) {
          badge(badgeData, makeSend(format, ask.res, end));
        }
      }, cachingRequest);
    });
  };
}

function clearRequestCache() {
  requestCache.clear();
}

module.exports = {
  handleRequest,
  clearRequestCache
};
