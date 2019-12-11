'use strict'

const { createRoute } = require('./dynamic-helpers')
const jsonPath = require('./json-path')
const { BaseJsonService } = require('..')

module.exports = class DynamicJson extends jsonPath(BaseJsonService) {
  static get route() {
    return createRoute('json')
  }

  async fetch({ schema, url, errorMessages }) {
    return this._requestJson({
      schema,
      url,
      errorMessages,
    })
  }
}
