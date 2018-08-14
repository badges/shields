'use strict'

// See available emoji at http://emoji.muan.co/
const emojic = require('emojic')
const Joi = require('joi')
const { checkErrorResponse, asJson } = require('../lib/error-helper')
const BaseService = require('./base')
const { InvalidResponse } = require('./errors')

class BaseJsonService extends BaseService {
  static _validate(json, schema) {
    const { error, value } = Joi.validate(json, schema, {
      allowUnknown: true,
      stripUnknown: true,
    })
    if (error) {
      this.logTrace(
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
      this.logTrace('validate', emojic.bathtub, 'JSON after validation', value)
      return value
    }
  }

  async _requestJson({ schema, url, options = {}, notFoundMessage }) {
    const logTrace = (...args) => this.constructor.logTrace('fetch', ...args)
    if (!schema || !schema.isJoi) {
      throw Error('A Joi schema is required')
    }
    const mergedOptions = {
      ...{ headers: { Accept: 'application/json' } },
      ...options,
    }
    logTrace(emojic.bowAndArrow, 'Request', url, '\n', mergedOptions)
    return this._sendAndCacheRequest(url, mergedOptions)
      .then(({ res, buffer }) => {
        logTrace(emojic.dart, 'Response status code', res.statusCode)
        return { res, buffer }
      })
      .then(
        checkErrorResponse.asPromise(
          notFoundMessage ? { notFoundMessage: notFoundMessage } : undefined
        )
      )
      .then(asJson)
      .then(json => {
        logTrace(emojic.dart, 'Response JSON (before validation)', json)
        return json
      })
      .then(json => this.constructor._validate(json, schema))
  }
}

module.exports = BaseJsonService
