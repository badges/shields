/**
 * @module
 */

import { InvalidResponse } from '../base-service/errors.js'
import { fetch } from '../../core/base-service/got.js'
import checkErrorResponse from '../../core/base-service/check-error-response.js'

// Map from URL to { timestamp: last fetch time, data: data }.
let regularUpdateCache = Object.create(null)

/**
 * Make a HTTP request using an in-memory cache
 *
 * @param {object} attrs Refer to individual attrs
 * @param {string} attrs.url URL to request
 * @param {number} attrs.intervalMillis Number of milliseconds to keep cached value for
 * @param {boolean} [attrs.json=true] True if we expect to parse the response as JSON
 * @param {Function} [attrs.scraper=buffer => buffer] Function to extract value from the response
 * @param {object} [attrs.options={}] Options to pass to got
 * @param {Function} [attrs.requestFetcher=fetcher] Custom fetch function
 * @returns {*} Parsed response
 */
async function regularUpdate({
  url,
  intervalMillis,
  json = true,
  scraper = buffer => buffer,
  options = {},
  requestFetcher = fetch,
}) {
  const timestamp = Date.now()
  const cached = regularUpdateCache[url]
  if (cached != null && timestamp - cached.timestamp < intervalMillis) {
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
  regularUpdateCache[url] = { timestamp, data }
  return data
}

function clearRegularUpdateCache() {
  regularUpdateCache = Object.create(null)
}

export { regularUpdate, clearRegularUpdateCache }
