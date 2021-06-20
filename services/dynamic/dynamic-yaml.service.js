import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseYamlService } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

export default class DynamicYaml extends jsonPath(BaseYamlService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('yaml')

  async fetch({ schema, url, errorMessages }) {
    return this._requestYaml({
      schema,
      url,
      errorMessages,
    })
  }
}
