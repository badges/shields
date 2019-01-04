'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const BaseService = require('./base')
const trace = require('./trace')
const { InvalidResponse } = require('./errors')

class BaseJsonService extends BaseService {
  _parseJson(buffer) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    let json
    try {
      json = JSON.parse(buffer)
    } catch (err) {
      logTrace(emojic.dart, 'Response JSON (unparseable)', buffer)
      throw new InvalidResponse({
        prettyMessage: 'unparseable json response',
        underlyingError: err,
      })
    }
    logTrace(emojic.dart, 'Response JSON (before validation)', json, {
      deep: true,
    })
    return json
  }

  async _requestJson({ schema, url, options = {}, errorMessages = {} }) {
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    const json = this._parseJson(buffer)
    return this.constructor._validate(json, schema)
  }
}

module.exports = BaseJsonService
