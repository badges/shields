'use strict';

// eslint-disable-next-line node/no-deprecated-api
const domain = require('domain');
const request = require('request');
const badge = require('./badge');
const { makeBadgeData: getBadgeData } = require('./badge-data');
const log = require('./log');
const LruCache = require('./lru-cache');
const analytics = require('./analytics');
const { makeSend } = require('./result-sender');
const queryString = require('query-string');

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
vendorDomain.on('error', err => {
  log.error('Vendor hook error:', err.stack);
});

// These query parameters are available to any badge. For the most part they
// are used by makeBadgeData (see `lib/badge-data.js`) and related functions.
const globalQueryParams = new Set([
  'label',
  'style',
  'link',
  'logo',
  'logoWidth',
  'link',
  'colorA',
  'colorB',
]);

function flattenQueryParams(queryParams) {
  const union = new Set(globalQueryParams);
  (queryParams || []).forEach(name => {
    union.add(name);
  });
  return Array.from(union).sort();
}

// handlerOptions can contain:
// - handler: The service's request handler function
// - queryParams: An array of the field names of any custom query parameters
//   the service uses
//
// For safety, the service must declare the query parameters it wants to use.
// Only the declared parameters (and the global parameters) are provided to
// the service. Consequently, failure to declare a parameter results in the
// parameter not working at all (which is undesirable, but easy to debug)
// rather than indeterminate behavior that depends on the cache state
// (undesirable and hard to debug).
//
// Pass just the handler function as shorthand.
function handleRequest (handlerOptions) {
  if (typeof handlerOptions === 'function') {
    handlerOptions = { handler: handlerOptions }
  }

  const allowedKeys = flattenQueryParams(handlerOptions.queryParams);

  return (queryParams, match, end, ask) => {
    if (queryParams.maxAge !== undefined && /^[0-9]+$/.test(queryParams.maxAge)) {
      ask.res.setHeader('Cache-Control', 'max-age=' + queryParams.maxAge);
    } else {
      // Cache management - no cache, so it won't be cached by GitHub's CDN.
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    }

    const reqTime = new Date();
    const date = reqTime.toGMTString();
    ask.res.setHeader('Expires', date);  // Proxies, GitHub, see #221.
    ask.res.setHeader('Date', date);

    analytics.noteRequest(queryParams, match);

    const filteredQueryParams = {};
    allowedKeys.forEach(key => {
      filteredQueryParams[key] = queryParams[key];
    });

    // Use sindresorhus query-string because it sorts the keys, whereas the
    // builtin querystring module relies on the iteration order.
    const stringified = queryString.stringify(filteredQueryParams);
    const cacheIndex = `${match[0]}?${stringified}`;

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
    const serverResponsive = setTimeout(() => {
      serverUnresponsive = true;
      if (cachedVersionSent) { return; }
      if (requestCache.has(cacheIndex)) {
        const cached = requestCache.get(cacheIndex).data;
        badge(cached.badgeData, makeSend(cached.format, ask.res, end));
        return;
      }
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      const badgeData = getBadgeData('vendor', filteredQueryParams);
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

      request(options, (err, res, body) => {
        if (res != null && res.headers != null) {
          const cacheControl = res.headers['cache-control'];
          if (cacheControl != null) {
            const age = cacheControl.match(/max-age=([0-9]+)/);
            // Would like to get some more test coverage on this before changing it.
            // eslint-disable-next-line no-self-compare
            if (age != null && (+age[1] === +age[1])) {
              cacheInterval = +age[1] * 1000;
            }
          }
        }
        callback(err, res, body);
      });
    }

    vendorDomain.run(() => {
      handlerOptions.handler(filteredQueryParams, match, function sendBadge(format, badgeData) {
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
  clearRequestCache,
  // Expose for testing.
  _requestCache: requestCache
};
