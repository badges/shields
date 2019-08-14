/**
 * @module
 */

'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const fastXmlParser = require('fast-xml-parser')
const BaseService = require('./base')
const trace = require('./trace')
const { InvalidResponse } = require('./errors')

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
   * @param {object} [attrs.options={}] Options to pass to request. See
   *    [documentation](https://github.com/request/request#requestoptions-callback)
   * @param {object} [attrs.errorMessages={}] Key-value map of status codes
   *    and custom error messages e.g: `{ 404: 'package not found' }`.
   *    This can be used to extend or override the
   *    [default](https://github.com/badges/shields/blob/master/core/base-service/check-error-response.js#L5)
   * @param {object} [attrs.parserOptions={}] Options to pass to fast-xml-parser. See
   *    [documentation](https://github.com/NaturalIntelligence/fast-xml-parser#xml-to-json)
   * @returns {object} Parsed response
   * @see https://github.com/request/request#requestoptions-callback
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
    const validateResult = fastXmlParser.validate(buffer)
    if (validateResult !== true) {
      throw new InvalidResponse({
        prettyMessage: 'unparseable xml response',
        underlyingError: validateResult.err,
      })
    }
    const xml = fastXmlParser.parse(buffer, parserOptions)
    logTrace(emojic.dart, 'Response XML (before validation)', xml, {
      deep: true,
    })
    return this.constructor._validate(xml, schema)
  }
}

module.exports = BaseXmlService
