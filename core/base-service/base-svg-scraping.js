/**
 * @module
 */

// See available emoji at http://emoji.muan.co/
import emojic from 'emojic'
import BaseService from './base.js'
import trace from './trace.js'
import { InvalidResponse } from './errors.js'

const defaultValueMatcher = />([^<>]+)<\/text><\/g>/
const leadingWhitespace = /(?:\r\n\s*|\r\s*|\n\s*)/g

/**
 * Services which scrape data from another SVG badge
 * should extend BaseSvgScrapingService
 *
 * @abstract
 */
class BaseSvgScrapingService extends BaseService {
  /**
   * Extract a value from SVG
   *
   * @param {string} svg SVG to parse
   * @param {RegExp} [valueMatcher=defaultValueMatcher]
   *    RegExp to match the value we want to parse from the SVG
   * @returns {string} Matched value
   */
  static valueFromSvgBadge(svg, valueMatcher = defaultValueMatcher) {
    if (typeof svg !== 'string') {
      throw new TypeError('Parameter should be a string')
    }
    const stripped = svg.replace(leadingWhitespace, '')
    const match = valueMatcher.exec(stripped)
    if (match) {
      return match[1]
    } else {
      throw new InvalidResponse({
        prettyMessage: 'unparseable svg response',
        underlyingError: Error(`Can't get value from SVG:\n${svg}`),
      })
    }
  }

  /**
   * Request data from an endpoint serving SVG,
   * parse a value from it and validate against a schema
   *
   * @param {object} attrs Refer to individual attrs
   * @param {Joi} attrs.schema Joi schema to validate the response against
   * @param {RegExp} attrs.valueMatcher
   *    RegExp to match the value we want to parse from the SVG
   * @param {string} attrs.url URL to request
   * @param {object} [attrs.options={}] Options to pass to got. See
   *    [documentation](https://github.com/sindresorhus/got/blob/main/documentation/2-options.md)
   * @param {object} [attrs.errorMessages={}] Key-value map of status codes
   *    and custom error messages e.g: `{ 404: 'package not found' }`.
   *    This can be used to extend or override the
   *    [default](https://github.com/badges/shields/blob/master/core/base-service/check-error-response.js#L5)
   * @returns {object} Parsed response
   * @see https://github.com/sindresorhus/got/blob/main/documentation/2-options.md
   */
  async _requestSvg({
    schema,
    valueMatcher,
    url,
    options = {},
    errorMessages = {},
  }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{ headers: { Accept: 'image/svg+xml' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    logTrace(emojic.dart, 'Response SVG', buffer)
    const data = {
      message: this.constructor.valueFromSvgBadge(buffer, valueMatcher),
    }
    logTrace(emojic.dart, 'Response SVG (before validation)', data, {
      deep: true,
    })
    return this.constructor._validate(data, schema)
  }
}

export default BaseSvgScrapingService
