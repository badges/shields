'use strict'

const Joi = require('joi')
const jp = require('jsonpath')
const { BaseJsonService, InvalidResponse } = require('..')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { createRoute } = require('./dynamic-helpers')

module.exports = class DynamicJson extends BaseJsonService {
  static get category() {
    return 'dynamic'
  }

  static get route() {
    return createRoute('json')
  }

  static get defaultBadgeData() {
    return {
      label: 'custom badge',
    }
  }

  async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
    const data = await this._requestJson({
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
