/**
 * @module
 */

// See available emoji at http://emoji.muan.co/
import emojic from 'emojic'
import { XMLParser, XMLValidator } from 'fast-xml-parser'
import BaseService from './base.js'
import trace from './trace.js'
import { InvalidResponse } from './errors.js'

/**
 * Services which query a XML endpoint should extend BaseXmlService
 *
 * @abstract
 */
class BaseXmlService extends BaseService {
  /**
   * Request data from an upstream API serving XML,
   * parse it and validate against a schema
   *
   * @param {object} attrs Refer to individual attrs
   * @param {Joi} attrs.schema Joi schema to validate the response against
   * @param {string} attrs.url URL to request
   * @param {object} [attrs.options={}] Options to pass to got. See
   *    [documentation](https://github.com/sindresorhus/got/blob/main/documentation/2-options.md)
   * @param {object} [attrs.errorMessages={}] Key-value map of status codes
   *    and custom error messages e.g: `{ 404: 'package not found' }`.
   *    This can be used to extend or override the
   *    [default](https://github.com/badges/shields/blob/master/core/base-service/check-error-response.js#L5)
   * @param {object} [attrs.parserOptions={}] Options to pass to fast-xml-parser. See
   *    [documentation](https://github.com/NaturalIntelligence/fast-xml-parser#xml-to-json)
   * @returns {object} Parsed response
   * @see https://github.com/sindresorhus/got/blob/main/documentation/2-options.md
   * @see https://github.com/NaturalIntelligence/fast-xml-parser#xml-to-json
   */
  async _requestXml({
    schema,
    url,
    options = {},
    errorMessages = {},
    parserOptions = {},
  }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{ headers: { Accept: 'application/xml, text/xml' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    const validateResult = XMLValidator.validate(buffer)
    if (validateResult !== true) {
      throw new InvalidResponse({
        prettyMessage: 'unparseable xml response',
        underlyingError: validateResult.err,
      })
    }
    const parser = new XMLParser(parserOptions)
    const xml = parser.parse(buffer)
    logTrace(emojic.dart, 'Response XML (before validation)', xml, {
      deep: true,
    })
    return this.constructor._validate(xml, schema)
  }
}

export default BaseXmlService
