'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const BaseService = require('./base')
const trace = require('./trace')
const { InvalidResponse } = require('./errors')

class BaseJsonService extends BaseService {
  async _requestJson({ schema, url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    let json
    try {
      json = JSON.parse(buffer)
    } catch (err) {
      logTrace(emojic.dart, 'Response JSON (unparseable)', json)
      throw new InvalidResponse({
        prettyMessage: 'unparseable json response',
        underlyingError: err,
      })
    }
    logTrace(emojic.dart, 'Response JSON (before validation)', json, {
      deep: true,
    })
    return this.constructor._validate(json, schema)
  }
}

module.exports = BaseJsonService
