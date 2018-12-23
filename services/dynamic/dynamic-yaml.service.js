'use strict'

const BaseYamlService = require('../base-yaml')
const { InvalidResponse } = require('../errors')
const Joi = require('joi')
const jp = require('jsonpath')
const { renderDynamicBadge } = require('../dynamic-common')
const {
  createRoute,
  queryParamSchema,
  errorMessages,
} = require('./dynamic-helpers')

module.exports = class DynamicYaml extends BaseYamlService {
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

  async handle(namedParams, queryParams) {
    const {
      url,
      query: pathExpression,
      prefix,
      suffix,
    } = this.constructor._validateQueryParams(queryParams, queryParamSchema)

    const data = await this._requestYaml({
      schema: Joi.any(),
      url,
      errorMessages,
    })

    const values = jp.query(data, pathExpression)

    if (!values.length) {
      throw new InvalidResponse({ prettyMessage: 'no result' })
    }

    return renderDynamicBadge({ value: values, prefix, suffix })
  }
}
