'use strict'

const { createRoute } = require('./dynamic-helpers')
const jsonPath = require('./json-path')
const { BaseJsonService } = require('..')

module.exports = class DynamicJson extends jsonPath(BaseJsonService) {
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

  async _getData({ schema, url, errorMessages }) {
    return this._requestJson({
      schema,
      url,
      errorMessages,
    })
  }
}
