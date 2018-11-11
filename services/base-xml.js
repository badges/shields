'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const fastXmlParser = require('fast-xml-parser')
const BaseService = require('./base')
const trace = require('./trace')
const { InvalidResponse } = require('./errors')

class BaseXmlService extends BaseService {
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
