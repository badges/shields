'use strict'

const request = require('request')
const queryString = require('query-string')
const makeBadge = require('../../gh-badges/lib/make-badge')
const { setCacheHeaders } = require('./cache-headers')
const {
  Inaccessible,
  InvalidResponse,
  ShieldsRuntimeError,
} = require('./errors')
const { makeSend } = require('./legacy-result-sender')
const LruCache = require('./lru-cache')
const coalesceBadge = require('./coalesce-badge')

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

// These query parameters are available to any badge. They are handled by
// `coalesceBadge`.
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
  'color',
  'labelColor',
])

function flattenQueryParams(queryParams) {
  const union = new Set(globalQueryParams)
  ;(queryParams || []).forEach(name => {
    union.add(name)
  })
  return Array.from(union).sort()
}

function promisify(cachingRequest) {
  return (uri, options) =>
    new Promise((resolve, reject) => {
      cachingRequest(uri, options, (err, res, buffer) => {
        if (err) {
          if (err instanceof ShieldsRuntimeError) {
            reject(err)
          } else {
            // Wrap the error in an Inaccessible so it can be identified
            // by the BaseService handler.
            reject(new Inaccessible({ underlyingError: err }))
          }
        } else {
          resolve({ res, buffer })
        }
      })
    })
}

// handlerOptions can contain:
// - handler: The service's request handler function
// - queryParams: An array of the field names of any custom query parameters
//   the service uses
// - cacheLength: An optional badge or category-specific cache length
//   (in number of seconds) to be used in preference to the default
// - fetchLimitBytes: A limit on the response size we're willing to parse
//
// For safety, the service must declare the query parameters it wants to use.
// Only the declared parameters (and the global parameters) are provided to
// the service. Consequently, failure to declare a parameter results in the
// parameter not working at all (which is undesirable, but easy to debug)
// rather than indeterminate behavior that depends on the cache state
// (undesirable and hard to debug).
//
// Pass just the handler function as shorthand.
function handleRequest(cacheHeaderConfig, handlerOptions) {
  if (!cacheHeaderConfig) {
    throw Error('cacheHeaderConfig is required')
  }

  if (typeof handlerOptions === 'function') {
    handlerOptions = { handler: handlerOptions }
  }

  const allowedKeys = flattenQueryParams(handlerOptions.queryParams)
  const {
    cacheLength: serviceDefaultCacheLengthSeconds,
    fetchLimitBytes,
  } = handlerOptions

  return (queryParams, match, end, ask) => {
    const reqTime = new Date()

    // `defaultCacheLengthSeconds` can be overridden by
    // `serviceDefaultCacheLengthSeconds` (either by category or on a badge-
    // by-badge basis). Then in turn that can be overridden by
    // `serviceOverrideCacheLengthSeconds` (which we expect to be used only in
    // the dynamic badge) but only if `serviceOverrideCacheLengthSeconds` is
    // longer than `serviceDefaultCacheLengthSeconds` and then the `cacheSeconds`
    // query param can also override both of those but again only if `cacheSeconds`
    // is longer.
    //
    // When the legacy services have been rewritten, all the code in here
    // will go away, which should achieve this goal in a simpler way.
    //
    // Ref: https://github.com/badges/shields/pull/2755
    function setCacheHeadersOnResponse(res, serviceOverrideCacheLengthSeconds) {
      setCacheHeaders({
        cacheHeaderConfig,
        serviceDefaultCacheLengthSeconds,
        serviceOverrideCacheLengthSeconds,
        queryParams,
        res,
      })
    }

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
        setCacheHeadersOnResponse(
          ask.res,
          cached.data.badgeData.cacheLengthSeconds
        )
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
        const cached = requestCache.get(cacheIndex)
        const svg = makeBadge(cached.data.badgeData)
        setCacheHeadersOnResponse(
          ask.res,
          cached.data.badgeData.cacheLengthSeconds
        )
        makeSend(cached.data.format, ask.res, end)(svg)
        return
      }
      ask.res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
      const badgeData = coalesceBadge(
        filteredQueryParams,
        { label: 'vendor', message: 'unresponsive' },
        {}
      )
      const svg = makeBadge(badgeData)
      const extension = (match.slice(-1)[0] || '.svg').replace(/^\./, '')
      setCacheHeadersOnResponse(ask.res)
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

      let bufferLength = 0
      const r = request(options, (err, res, body) => {
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
      r.on('data', chunk => {
        bufferLength += chunk.length
        if (bufferLength > fetchLimitBytes) {
          r.abort()
          r.emit(
            'error',
            new InvalidResponse({
              prettyMessage: 'Maximum response size exceeded',
            })
          )
        }
      })
    }

    // Wrapper around `cachingRequest` that returns a promise rather than needing
    // to pass a callback.
    cachingRequest.asPromise = promisify(cachingRequest)

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
          dataChange: cached ? cached.dataChange + (dataHasChanged ? 1 : 0) : 1,
          time: +reqTime,
          interval: cacheInterval,
          data: { format, badgeData },
        }
        requestCache.set(cacheIndex, updatedCache)
        if (!cachedVersionSent) {
          const svg = makeBadge(badgeData)
          setCacheHeadersOnResponse(ask.res, badgeData.cacheLengthSeconds)
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
  }
}

function clearRequestCache() {
  requestCache.clear()
}

module.exports = {
  handleRequest,
  promisify,
  clearRequestCache,
  // Expose for testing.
  _requestCache: requestCache,
}
