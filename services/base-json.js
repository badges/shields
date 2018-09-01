'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const { asJson } = require('../lib/response-parsers')
const BaseService = require('./base')
const trace = require('./trace')

class BaseJsonService extends BaseService {
  async _requestJson({ schema, url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    const jsonData = await this._request({ url, mergedOptions, errorMessages })
    const json = await asJson(jsonData)
    logTrace(emojic.dart, 'Response JSON (before validation)', json, {
      deep: true,
    })
    return this.constructor._validate(json, schema)
  }
}

module.exports = BaseJsonService
