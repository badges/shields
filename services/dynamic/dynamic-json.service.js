import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseJsonService } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

export default class DynamicJson extends jsonPath(BaseJsonService) {
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
