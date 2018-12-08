'use strict'

const yaml = require('js-yaml')
const jp = require('jsonpath')
const emojic = require('emojic')
const BaseService = require('../base')
const { InvalidResponse } = require('../errors')
const trace = require('../trace')
const {
  createRoute,
  queryParamSchema,
  errorMessages,
  renderDynamicBadge,
} = require('./dynamic-helpers')

module.exports = class DynamicYaml extends BaseService {
  static get category() {
    return 'dynamic'
  }

  static get route() {
    return createRoute('yaml')
  }

  static get defaultBadgeData() {
    return {
      label: 'custom badge',
    }
  }

  parseYml(buffer) {
    const logTrace = (...args) => trace.logTrace('fetch', ...args)
    let parsed
    try {
      parsed = yaml.safeLoad(buffer)
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
    return parsed
  }

  async handle(namedParams, queryParams) {
    const {
      url,
      query: pathExpression,
      prefix,
      suffix,
    } = this.constructor._validateQueryParams(queryParams, queryParamSchema)

    const { buffer } = await this._request({
      url,
      options: {
        headers: {
          Accept:
            'text/x-yaml, text/yaml, application/x-yaml, application/yaml, text/plain',
        },
      },
      errorMessages,
    })

    const data = this.parseYml(buffer)

    const values = jp.query(data, pathExpression)

    if (!values.length) {
      throw new InvalidResponse({ prettyMessage: 'no result' })
    }

    return renderDynamicBadge({ values, prefix, suffix })
  }
}
