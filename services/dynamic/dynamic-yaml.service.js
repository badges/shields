'use strict'

const Joi = require('@hapi/joi')
const jp = require('jsonpath')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { createRoute } = require('./dynamic-helpers')
const { BaseYamlService, InvalidResponse } = require('..')

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

  async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
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
