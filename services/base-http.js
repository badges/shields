'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const { checkErrorResponse } = require('../lib/error-helper')
const BaseService = require('./base')
const trace = require('./trace')

class BaseHTTPService extends BaseService {

  async _requestHTTP({ url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    logTrace(emojic.bowAndArrow, 'Request', url, '\n', options)
    return this._sendAndCacheRequest(url, options)
      .then(({ res, buffer }) => {
        logTrace(emojic.dart, 'Response status code', res.statusCode)
        return { res, buffer }
      })
      .then(checkErrorResponse.asPromise(errorMessages))
  }
}

module.exports = BaseHTTPService

