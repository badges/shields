/**
 * @module
 */

import { InvalidResponse } from './errors.js'
import { fetch } from './got.js'
import checkErrorResponse from './check-error-response.js'

const oneDay = 24 * 3600 * 1000 // 1 day in milliseconds

// Map from URL to { timestamp: last fetch time, data: data }.
let resourceCache = Object.create(null)

/**
 * Make a HTTP request using an in-memory cache
 *
 * @param {object} attrs Refer to individual attrs
 * @param {string} attrs.url URL to request
 * @param {number} attrs.ttl Number of milliseconds to keep cached value for
 * @param {boolean} [attrs.json=true] True if we expect to parse the response as JSON
 * @param {Function} [attrs.scraper=buffer => buffer] Function to extract value from the response
 * @param {object} [attrs.options={}] Options to pass to got
 * @param {Function} [attrs.requestFetcher=fetch] Custom fetch function
 * @returns {*} Parsed response
 */
async function getCachedResource({
  url,
  ttl = oneDay,
  json = true,
  scraper = buffer => buffer,
  options = {},
  requestFetcher = fetch,
}) {
  const timestamp = Date.now()
  const cached = resourceCache[url]
  if (cached != null && timestamp - cached.timestamp < ttl) {
    return cached.data
  }

  const { buffer } = await checkErrorResponse({})(
    await requestFetcher(url, options)
  )

  let reqData
  if (json) {
    try {
      reqData = JSON.parse(buffer)
    } catch (e) {
      throw new InvalidResponse({
        prettyMessage: 'unparseable intermediate json response',
        underlyingError: e,
      })
    }
  } else {
    reqData = buffer
  }

  const data = scraper(reqData)
  resourceCache[url] = { timestamp, data }
  return data
}

function clearResourceCache() {
  resourceCache = Object.create(null)
}

export { getCachedResource, clearResourceCache }
