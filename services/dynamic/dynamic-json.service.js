'use strict'

const { MetricNames } = require('../../core/base-service/metric-helper')
const { BaseJsonService } = require('..')
const { createRoute } = require('./dynamic-helpers')
const jsonPath = require('./json-path')

module.exports = class DynamicJson extends jsonPath(BaseJsonService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('json')

  async fetch({ schema, url, errorMessages }) {
    return this._requestJson({
      schema,
      url,
      errorMessages,
    })
  }
}
