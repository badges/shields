import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseJsonService } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

export default class DynamicJson extends jsonPath(BaseJsonService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('json')
  static examples = [
    {
      title: 'Dynamic JSON Badge',
      namedParams: {},
      queryParams: {
        url: 'https://github.com/badges/shields/raw/master/package.json',
        query: '$.name',
        prefix: '[',
        suffix: ']',
      },
      documentation: `<p>
        The dynamic JSON badge takes two required query params: <code>url</code> and <code>query</code>.
        <ul>
          <li><code>url</code> is the URL to a JSON document</li>
          <li><code>query</code> is a <a href="https://jsonpath.com/">JSONPath</a> expression that will be used to query the document</li>
        </ul>
        Also an optional <code>prefix</code> and <code>suffix</code> may be supplied.
      </p>`,
      staticPreview: {
        message: 'shields.io',
      },
    },
  ]

  async fetch({ schema, url, errorMessages }) {
    return this._requestJson({
      schema,
      url,
      errorMessages,
    })
  }
}
