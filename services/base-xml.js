'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const { asXml } = require('../lib/response-parsers')
const BaseService = require('./base')
const trace = require('./trace')

class BaseXmlService extends BaseService {
  async _requestXml({ schema, url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{ headers: { Accept: 'application/xml, text/xml' } },
      ...options,
    }
    const xmlData = await this._request({ url, mergedOptions, errorMessages })
    const xml = await asXml(xmlData)
    logTrace(emojic.dart, 'Response XML (before validation)', xml, {
      deep: true,
    })
    return this.constructor._validate(xml, schema)
  }
}

module.exports = BaseXmlService
