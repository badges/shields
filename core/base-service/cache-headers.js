import assert from 'assert'
import Joi from 'joi'
import coalesce from './coalesce.js'

const serverStartTimeGMTString = new Date().toGMTString()
const serverStartTimestamp = Date.now()

const isOptionalNonNegativeInteger = Joi.number().integer().min(0)

const queryParamSchema = Joi.object({
  cacheSeconds: isOptionalNonNegativeInteger,
  maxAge: isOptionalNonNegativeInteger,
})
  .oxor('cacheSeconds', 'maxAge')
  .unknown(true)
  .required()

function overrideCacheLengthFromQueryParams(queryParams) {
  try {
    const {
      cacheSeconds: overrideCacheLength,
      maxAge: legacyOverrideCacheLength,
    } = Joi.attempt(queryParams, queryParamSchema)
    return coalesce(overrideCacheLength, legacyOverrideCacheLength)
  } catch (e) {
    return undefined
  }
}

function coalesceCacheLength({
  cacheHeaderConfig,
  serviceDefaultCacheLengthSeconds,
  serviceOverrideCacheLengthSeconds,
  queryParams,
}) {
  const { defaultCacheLengthSeconds } = cacheHeaderConfig
  // The config returns a number so this should never happen. But this logic
  // would be completely broken if it did.
  assert(defaultCacheLengthSeconds !== undefined)

  const cacheLength = coalesce(
    serviceOverrideCacheLengthSeconds,
    serviceDefaultCacheLengthSeconds,
    defaultCacheLengthSeconds,
  )

  // Overrides can apply _more_ caching, but not less. Query param overriding
  // can request more overriding than service override, but not less.
  const candidateOverrides = [
    overrideCacheLengthFromQueryParams(queryParams),
  ].filter(x => x !== undefined)

  return Math.max(cacheLength, ...candidateOverrides)
}

function setHeadersForCacheLength(res, cacheLengthSeconds) {
  const now = new Date()
  const nowGMTString = now.toGMTString()

  // Send both Cache-Control max-age and Expires in case the client implements
  // HTTP/1.0 but not HTTP/1.1.
  let cacheControl, expires
  if (cacheLengthSeconds === 0) {
    // Prevent as much downstream caching as possible.
    cacheControl = 'no-cache, no-store, must-revalidate'
    expires = nowGMTString
  } else {
    cacheControl = `max-age=${cacheLengthSeconds}, s-maxage=${cacheLengthSeconds}`
    expires = new Date(now.getTime() + cacheLengthSeconds * 1000).toGMTString()
  }

  res.setHeader('Date', nowGMTString)
  res.setHeader('Cache-Control', cacheControl)
  res.setHeader('Expires', expires)
}

function setCacheHeaders({
  cacheHeaderConfig,
  serviceDefaultCacheLengthSeconds,
  serviceOverrideCacheLengthSeconds,
  queryParams,
  res,
}) {
  const cacheLengthSeconds = coalesceCacheLength({
    cacheHeaderConfig,
    serviceDefaultCacheLengthSeconds,
    serviceOverrideCacheLengthSeconds,
    queryParams,
  })
  setHeadersForCacheLength(res, cacheLengthSeconds)
}

function setCacheHeadersForStaticResource(
  res,
  maxAge = 24 * 3600, // 1 day
) {
  const staticCacheControlHeader = `max-age=${maxAge}, s-maxage=${maxAge}`
  res.setHeader('Cache-Control', staticCacheControlHeader)
  res.setHeader('Last-Modified', serverStartTimeGMTString)
}

function serverHasBeenUpSinceResourceCached(req) {
  return (
    serverStartTimestamp <= new Date(req.headers['if-modified-since']).getTime()
  )
}

export {
  coalesceCacheLength,
  setCacheHeaders,
  setHeadersForCacheLength,
  setCacheHeadersForStaticResource,
  serverHasBeenUpSinceResourceCached,
}
