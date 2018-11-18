'use strict'

const assert = require('assert')
const coalesce = require('../lib/coalesce')

const serverStartTime = new Date(new Date().toGMTString())
const serverStartTimeGMTString = serverStartTime.toGMTString()

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
  const reqTime = new Date()
  const reqTimeGMTString = reqTime.toGMTString()

  res.setHeader('Date', reqTimeGMTString)

  // Send both Cache-Control max-age and Expires in case the client implements
  // HTTP/1.0 but not HTTP/1.1.
  if (cacheLengthSeconds === 0) {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate')
    res.setHeader('Expires', reqTimeGMTString)
  } else {
    res.setHeader('Cache-Control', `max-age=${cacheLengthSeconds}`)

    const date = new Date(+reqTime + cacheLengthSeconds * 1000).toGMTString()
    res.setHeader('Expires', date)
  }
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
  return +serverStartTime <= +new Date(req.headers['if-modified-since'])
}

module.exports = {
  coalesceCacheLength,
  setCacheHeaders,
  setHeadersForCacheLength,
  setCacheHeadersForStaticResource,
  serverHasBeenUpSinceResourceCached,
}
