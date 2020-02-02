'use strict'

const { MetricNames } = require('../../core/base-service/metric-helper')
const { createRoute } = require('./dynamic-helpers')
const jsonPath = require('./json-path')
const { BaseJsonService } = require('..')

module.exports = class DynamicJson extends jsonPath(BaseJsonService) {
  static get enabledMetrics() {
    return [MetricNames.SERVICE_RESPONSE_SIZE]
  }

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
