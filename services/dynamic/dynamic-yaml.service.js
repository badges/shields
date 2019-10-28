'use strict'

const { createRoute } = require('./dynamic-helpers')
const jsonPath = require('./json-path')
const { BaseYamlService } = require('..')

module.exports = class DynamicYaml extends jsonPath(BaseYamlService) {
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

  async _getData({ schema, url, errorMessages }) {
    return this._requestYaml({
      schema,
      url,
      errorMessages,
    })
  }
}
