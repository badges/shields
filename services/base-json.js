'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const Joi = require('joi')
const { asJson } = require('../lib/error-helper')
const BaseHTTPService = require('./base-http')
const { InvalidResponse } = require('./errors')
const trace = require('./trace')

class BaseJsonService extends BaseHTTPService {
  static _validate(json, schema) {
    const { error, value } = Joi.validate(json, schema, {
      allowUnknown: true,
      stripUnknown: true,
    })
    if (error) {
      trace.logTrace(
        'validate',
        emojic.womanShrugging,
        'Response did not match schema',
        error.message
      )
      throw new InvalidResponse({
        prettyMessage: 'invalid json response',
        underlyingError: error,
      })
    } else {
      trace.logTrace(
        'validate',
        emojic.bathtub,
        'JSON after validation',
        value,
        { deep: true }
      )
      return value
    }
  }

  async _requestJson({ schema, url, options = {}, errorMessages = {} }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    if (!schema || !schema.isJoi) {
      throw Error('A Joi schema is required')
    }
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    return this._requestHTTP({ url, options: mergedOptions, errorMessages })
      .then(asJson)
      .then(json => {
        logTrace(emojic.dart, 'Response JSON (before validation)', json, {
          deep: true,
        })
        return json
      })
      .then(json => this.constructor._validate(json, schema))
  }
}

module.exports = BaseJsonService
