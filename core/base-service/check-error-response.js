/**
 * @module
 */

import log from '../server/log.js'
import { NotFound, InvalidResponse, Inaccessible } from './errors.js'

const defaultErrorMessages = {
  404: 'not found',
  429: 'rate limited by upstream service',
}

const headersToInclude = ['cf-ray']

/**
 * Create a handler that validates HTTP status codes from upstream API responses.
 *
 * Used in the `got` response pipeline by {@link module:core/base-service/base~BaseService}
 * and related helpers. On status 200 the handler returns the inputs unchanged.
 * On other status codes it throws a {@link NotFound}, {@link InvalidResponse}, or
 * {@link Inaccessible} exception. Thrown errors include `response` and `buffer`
 * from the upstream call for debugging.
 *
 * @param {object} [httpErrors={}] Status-code-to-message map merged with defaults.
 *   Keys are numeric HTTP status codes. Values set the `prettyMessage` shown on
 *   the badge. Defaults include `404: 'not found'` and
 *   `429: 'rate limited by upstream service'`.
 * @param {number[]} [logErrors=[429]] Status codes to log when encountered.
 *   Selected response headers (for example `cf-ray`) are attached as log tags.
 * @returns {function({buffer: Buffer, res: object}): Promise<{buffer: Buffer, res: object}>}
 *   Async handler. Resolves with `{ buffer, res }` on 200; otherwise throws.
 */
export default function checkErrorResponse(httpErrors = {}, logErrors = [429]) {
  return async function ({ buffer, res }) {
    let error
    httpErrors = { ...defaultErrorMessages, ...httpErrors }
    if (res.statusCode === 404) {
      error = new NotFound({ prettyMessage: httpErrors[404] })
    } else if (res.statusCode !== 200) {
      const underlying = Error(
        `Got status code ${res.statusCode} (expected 200)`,
      )
      const props = { underlyingError: underlying }
      if (httpErrors[res.statusCode] !== undefined) {
        props.prettyMessage = httpErrors[res.statusCode]
      }
      if (res.statusCode >= 500) {
        error = new Inaccessible(props)
      } else {
        error = new InvalidResponse(props)
      }
    }

    if (logErrors.includes(res.statusCode)) {
      const tags = {}
      for (const headerKey of headersToInclude) {
        const headerValue = res.headers[headerKey]
        if (headerValue) {
          tags[`header-${headerKey}`] = headerValue
        }
      }
      log.error(
        new Error(`${res.statusCode} calling ${res.requestUrl.origin}`),
        tags,
      )
    }

    if (error) {
      error.response = res
      error.buffer = buffer
      throw error
    } else {
      return { buffer, res }
    }
  }
}
