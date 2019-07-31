'use strict'

const Joi = require('@hapi/joi')
const jp = require('jsonpath')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { createRoute } = require('./dynamic-helpers')
const { BaseJsonService, InvalidParameter, InvalidResponse } = require('..')

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

    let values
    try {
      values = jp.query(data, pathExpression)
    } catch (e) {
      const { message } = e
      if (
        message.startsWith('Lexical error') ||
        message.startsWith('Parse error')
      ) {
        throw new InvalidParameter({
          prettyMessage: 'unparseable jsonpath query',
        })
      } else {
        throw e
      }
    }

    if (!values.length) {
      throw new InvalidResponse({ prettyMessage: 'no result' })
    }

    return renderDynamicBadge({ value: values, prefix, suffix })
  }
}
