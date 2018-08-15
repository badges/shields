'use strict'

const Joi = require('joi')
const BaseJsonService = require('../base-json')

const schema = Joi.any()

module.exports = class PypiBase extends BaseJsonService {
  static buildUrl(base) {
    return {
      base,
      format: '(.*)',
      capture: ['egg'],
    }
  }

  async fetch({ egg }) {
    return this._requestJson({
      schema,
      url: `https://pypi.org/pypi/${egg}/json`,
      notFoundMessage: 'package or version not found',
    })
  }
}
