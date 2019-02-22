'use strict'

const emojic = require('emojic')
const yaml = require('js-yaml')
const BaseService = require('./base')
const { InvalidResponse } = require('./errors')
const trace = require('./trace')

class BaseYamlService extends BaseService {
  async _requestYaml({
    schema,
    url,
    options = {},
    errorMessages = {},
    encoding = 'utf8',
  }) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    const mergedOptions = {
      ...{
        headers: {
          Accept:
            'text/x-yaml, text/yaml, application/x-yaml, application/yaml, text/plain',
        },
      },
      ...options,
    }
    const { buffer } = await this._request({
      url,
      options: mergedOptions,
      errorMessages,
    })
    let parsed
    try {
      parsed = yaml.safeLoad(buffer.toString(), encoding)
    } catch (err) {
      logTrace(emojic.dart, 'Response YAML (unparseable)', buffer)
      throw new InvalidResponse({
        prettyMessage: 'unparseable yaml response',
        underlyingError: err,
      })
    }
    logTrace(emojic.dart, 'Response YAML (before validation)', parsed, {
      deep: true,
    })
    return this.constructor._validate(parsed, schema)
  }
}

module.exports = BaseYamlService
