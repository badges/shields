'use strict'

const BaseService = require('./base')
const { parseJson } = require('./json')

class BaseJsonService extends BaseService {
  _parseJson(buffer) {
    return parseJson(buffer)
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
