'use strict'

const { MetricNames } = require('../../core/base-service/metric-helper')
const { BaseYamlService } = require('..')
const { createRoute } = require('./dynamic-helpers')
const jsonPath = require('./json-path')

module.exports = class DynamicYaml extends jsonPath(BaseYamlService) {
  static get enabledMetrics() {
    return [MetricNames.SERVICE_RESPONSE_SIZE]
  }

  static get route() {
    return createRoute('yaml')
  }

  async fetch({ schema, url, errorMessages }) {
    return this._requestYaml({
      schema,
      url,
      errorMessages,
    })
  }
}
