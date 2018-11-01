'use strict'

// eslint-disable-next-line node/no-deprecated-api
const domain = require('domain')
const request = require('request')
const { makeBadgeData: getBadgeData } = require('./badge-data')
const log = require('./log')
const LruCache = require('./lru-cache')
const analytics = require('./analytics')
const { makeSend } = require('./result-sender')
const queryString = require('query-string')
const { Inaccessible } = require('../services/errors')

// We avoid calling the vendor's server for computation of the information in a
// number of badges.
const minAccuracy = 0.75

// The quotient of (vendor) data change frequency by badge request frequency
// must be lower than this to trigger sending the cached data *before*
// updating our data from the vendor's server.
// Indeed, the accuracy of our badges are:
// A(Δt) = 1 - min(# data change over Δt, # requests over Δt)
//             / (# requests over Δt)
//       = 1 - max(1, df) / rf
const freqRatioMax = 1 - minAccuracy

// Request cache size of 5MB (~5000 bytes/image).
const requestCache = new LruCache(1000)

// Deep error handling for vendor hooks.
const vendorDomain = domain.create()
vendorDomain.on('error', err => {
  log.error('Vendor hook error:', err.stack)
})

// These query parameters are available to any badge. For the most part they
// are used by makeBadgeData (see `lib/badge-data.js`) and related functions.
const globalQueryParams = new Set([
  'label',
  'style',
  'link',
  'logo',
  'logoColor',
  'logoPosition',
  'logoWidth',
  'link',
  'colorA',
  'colorB',
])

function flattenQueryParams(queryParams) {
  const union = new Set(globalQueryParams)
  ;(queryParams || []).forEach(name => {
    union.add(name)
  })
  return Array.from(union).sort()
}

function getBadgeMaxAge(handlerOptions, queryParams) {
  let maxAge = isInt(process.env.BADGE_MAX_AGE_SECONDS)
    ? parseInt(process.env.BADGE_MAX_AGE_SECONDS)
    : 120
  if (handlerOptions.cacheLength) {
    // if we've set a more specific cache length for this badge (or category),
    // use that instead of env.BADGE_MAX_AGE_SECONDS
    maxAge = parseInt(handlerOptions.cacheLength)
  }
  if (isInt(queryParams.maxAge) && parseInt(queryParams.maxAge) > maxAge) {
    // only allow queryParams.maxAge to override the default
    // if it is greater than the default
    maxAge = parseInt(queryParams.maxAge)
  }
  return maxAge
}

// handlerOptions can contain:
// - handler: The service's request handler function
// - queryParams: An array of the field names of any custom query parameters
//   the service uses
// - cacheLength: An optional badge or category-specific cache length
//   (in number of seconds) to be used in preference to the default
//
// For safety, the service must declare the query parameters it wants to use.
// Only the declared parameters (and the global parameters) are provided to
// the service. Consequently, failure to declare a parameter results in the
// parameter not working at all (which is undesirable, but easy to debug)
// rather than indeterminate behavior that depends on the cache state
// (undesirable and hard to debug).
//
// Pass just the handler function as shorthand.
//
// Inject `makeBadge` as a dependency.
function handleRequest(makeBadge, handlerOptions) {
  if (typeof handlerOptions === 'function') {
    handlerOptions = { handler: handlerOptions }
  }

  const allowedKeys = flattenQueryParams(handlerOptions.queryParams)

  return (queryParams, match, end, ask) => {
    const reqTime = new Date()

    const maxAge = getBadgeMaxAge(handlerOptions, queryParams)
    // send both Cache-Control max-age and Expires
    // in case the client implements HTTP/1.0 but not HTTP/1.1
    if (maxAge === 0) {
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      ask.res.setHeader('Expires', reqTime.toGMTString())
    } else {
      ask.res.setHeader('Cache-Control', 'max-age=' + maxAge)
      ask.res.setHeader(
        'Expires',
        new Date(+reqTime + maxAge * 1000).toGMTString()
      )
    }

    ask.res.setHeader('Date', reqTime.toGMTString())

    analytics.noteRequest(queryParams, match)

    const filteredQueryParams = {}
    allowedKeys.forEach(key => {
      filteredQueryParams[key] = queryParams[key]
    })

    // Use sindresorhus query-string because it sorts the keys, whereas the
    // builtin querystring module relies on the iteration order.
    const stringified = queryString.stringify(filteredQueryParams)
    const cacheIndex = `${match[0]}?${stringified}`

    // Should we return the data right away?
    const cached = requestCache.get(cacheIndex)
    let cachedVersionSent = false
    if (cached !== undefined) {
      // A request was made not long ago.
      const tooSoon = +reqTime - cached.time < cached.interval
      if (tooSoon || cached.dataChange / cached.reqs <= freqRatioMax) {
        const svg = makeBadge(cached.data.badgeData)
        makeSend(cached.data.format, ask.res, end)(svg)
        cachedVersionSent = true
        // We do not wish to call the vendor servers.
        if (tooSoon) {
          return
        }
      }
    }

    // In case our vendor servers are unresponsive.
    let serverUnresponsive = false
    const serverResponsive = setTimeout(() => {
      serverUnresponsive = true
      if (cachedVersionSent) {
        return
      }
      if (requestCache.has(cacheIndex)) {
        const cached = requestCache.get(cacheIndex).data
        const svg = makeBadge(cached.badgeData)
        makeSend(cached.format, ask.res, end)(svg)
        return
      }
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      const badgeData = getBadgeData('vendor', filteredQueryParams)
      badgeData.text[1] = 'unresponsive'
      let extension
      try {
        extension = match[0].split('.').pop()
      } catch (e) {
        extension = 'svg'
      }
      const svg = makeBadge(badgeData)
      makeSend(extension, ask.res, end)(svg)
    }, 25000)

    // Only call vendor servers when last request is older than…
    let cacheInterval = 5000 // milliseconds
    function cachingRequest(uri, options, callback) {
      if (typeof options === 'function' && !callback) {
        callback = options
      }
      if (options && typeof options === 'object') {
        options.uri = uri
      } else if (typeof uri === 'string') {
        options = { uri }
      } else {
        options = uri
      }
      options.headers = options.headers || {}
      options.headers['User-Agent'] =
        options.headers['User-Agent'] || 'Shields.io'

      request(options, (err, res, body) => {
        if (res != null && res.headers != null) {
          const cacheControl = res.headers['cache-control']
          if (cacheControl != null) {
            const age = cacheControl.match(/max-age=([0-9]+)/)
            // Would like to get some more test coverage on this before changing it.
            // eslint-disable-next-line no-self-compare
            if (age != null && +age[1] === +age[1]) {
              cacheInterval = +age[1] * 1000
            }
          }
        }
        callback(err, res, body)
      })
    }

    // Wrapper around `cachingRequest` that returns a promise rather than
    // needing to pass a callback.
    cachingRequest.asPromise = (uri, options) =>
      new Promise((resolve, reject) => {
        cachingRequest(uri, options, (err, res, buffer) => {
          if (err) {
            // Wrap the error in an Inaccessible so it can be identified
            // by the BaseService handler.
            reject(new Inaccessible({ underlyingError: err }))
          } else {
            resolve({ res, buffer })
          }
        })
      })

    vendorDomain.run(() => {
      const result = handlerOptions.handler(
        filteredQueryParams,
        match,
        // eslint-disable-next-line mocha/prefer-arrow-callback
        function sendBadge(format, badgeData) {
          if (serverUnresponsive) {
            return
          }
          clearTimeout(serverResponsive)
          // Check for a change in the data.
          let dataHasChanged = false
          if (
            cached !== undefined &&
            cached.data.badgeData.text[1] !== badgeData.text[1]
          ) {
            dataHasChanged = true
          }
          // Add format to badge data.
          badgeData.format = format
          // Update information in the cache.
          const updatedCache = {
            reqs: cached ? cached.reqs + 1 : 1,
            dataChange: cached
              ? cached.dataChange + (dataHasChanged ? 1 : 0)
              : 1,
            time: +reqTime,
            interval: cacheInterval,
            data: { format, badgeData },
          }
          requestCache.set(cacheIndex, updatedCache)
          if (!cachedVersionSent) {
            const svg = makeBadge(badgeData)
            makeSend(format, ask.res, end)(svg)
          }
        },
        cachingRequest
      )
      if (result && result.catch) {
        result.catch(err => {
          throw err
        })
      }
    })
  }
}

function clearRequestCache() {
  requestCache.clear()
}

function isInt(number) {
  return number !== undefined && /^[0-9]+$/.test(number)
}

module.exports = {
  handleRequest,
  makeHandleRequestFn: makeBadge => handlerOptions =>
    handleRequest(makeBadge, handlerOptions),
  clearRequestCache,
  // Expose for testing.
  _requestCache: requestCache,
  getBadgeMaxAge,
}
