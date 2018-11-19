'use strict'

const assert = require('assert')
const coalesce = require('../lib/coalesce')

const serverStartTimeGMTString = new Date().toGMTString()
const serverStartTimestamp = Date.now()

const numRegex = /^[0-9]+$/
function isInt(number) {
  return number !== undefined && numRegex.test(number)
}

function coalesceCacheLength(
  cacheHeaderConfig,
  serviceCacheLengthSeconds,
  queryParams
) {
  const { defaultCacheLengthSeconds } = cacheHeaderConfig
  // The config returns a number so this would only fail if we break the
  // wiring. Better to fail obviously than silently.
  assert(defaultCacheLengthSeconds !== undefined)

  const ourCacheLength = coalesce(
    serviceCacheLengthSeconds,
    defaultCacheLengthSeconds
  )

  const { maxAge: maxAgeParam } = queryParams
  if (isInt(maxAgeParam)) {
    const overrideCacheLength = parseInt(maxAgeParam)
    // The user can request _more_ caching, but not less.
    return Math.max(overrideCacheLength, ourCacheLength)
  } else {
    return ourCacheLength
  }
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
    cacheControl = `max-age=${cacheLengthSeconds}`
    expires = new Date(now.getTime() + cacheLengthSeconds * 1000).toGMTString()
  }

  res.setHeader('Date', nowGMTString)
  res.setHeader('Cache-Control', cacheControl)
  res.setHeader('Expires', expires)
}

function setCacheHeaders({
  cacheHeaderConfig,
  serviceCacheLengthSeconds,
  queryParams,
  res,
}) {
  const cacheLengthSeconds = coalesceCacheLength(
    cacheHeaderConfig,
    serviceCacheLengthSeconds,
    queryParams
  )
  setHeadersForCacheLength(res, cacheLengthSeconds)
}

const staticCacheControlHeader = `max-age=${24 * 3600}` // 1 day.
function setCacheHeadersForStaticResource(res) {
  res.setHeader('Cache-Control', staticCacheControlHeader)
  res.setHeader('Last-Modified', serverStartTimeGMTString)
}

function serverHasBeenUpSinceResourceCached(req) {
  return (
    serverStartTimestamp <= new Date(req.headers['if-modified-since']).getTime()
  )
}

module.exports = {
  coalesceCacheLength,
  setCacheHeaders,
  setHeadersForCacheLength,
  setCacheHeadersForStaticResource,
  serverHasBeenUpSinceResourceCached,
}
