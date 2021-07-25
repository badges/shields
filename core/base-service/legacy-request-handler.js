import request from 'request'
import makeBadge from '../../badge-maker/lib/make-badge.js'
import { setCacheHeaders } from './cache-headers.js'
import { Inaccessible, InvalidResponse, ShieldsRuntimeError } from './errors.js'
import { makeSend } from './legacy-result-sender.js'
import coalesceBadge from './coalesce-badge.js'

const userAgent = 'Shields.io/2003a'

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
  const { cacheLength: serviceDefaultCacheLengthSeconds, fetchLimitBytes } =
    handlerOptions

  return (queryParams, match, end, ask) => {
    /*
    This is here for legacy reasons. The badge server and frontend used to live
    on two different servers. When we merged them there was a conflict so we
    did this to avoid moving the endpoint docs to another URL.

    Never ever do this again.
    */
    if (match[0] === '/endpoint' && Object.keys(queryParams).length === 0) {
      ask.res.statusCode = 301
      ask.res.setHeader('Location', '/endpoint/')
      ask.res.end()
      return
    }

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

    // In case our vendor servers are unresponsive.
    let serverUnresponsive = false
    const serverResponsive = setTimeout(() => {
      serverUnresponsive = true
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
      options.headers['User-Agent'] = userAgent

      let bufferLength = 0
      const r = request(options, callback)
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
        // Add format to badge data.
        badgeData.format = format
        const svg = makeBadge(badgeData)
        setCacheHeadersOnResponse(ask.res, badgeData.cacheLengthSeconds)
        makeSend(format, ask.res, end)(svg)
      },
      cachingRequest
    )
    // eslint-disable-next-line promise/prefer-await-to-then
    if (result && result.catch) {
      // eslint-disable-next-line promise/prefer-await-to-then
      result.catch(err => {
        throw err
      })
    }
  }
}

export { handleRequest, promisify, userAgent }
