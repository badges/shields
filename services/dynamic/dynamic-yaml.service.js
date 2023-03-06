import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseYamlService } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

export default class DynamicYaml extends jsonPath(BaseYamlService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('yaml')
  static examples = [
    {
      title: 'Dynamic YAML Badge',
      namedParams: {},
      queryParams: {
        url: 'https://raw.githubusercontent.com/badges/shields/master/.github/dependabot.yml',
        query: '$.version',
        prefix: '[',
        suffix: ']',
      },
      documentation: `<p>
        The dynamic YAML badge takes two required query params: <code>url</code> and <code>query</code>.
        <ul>
          <li><code>url</code> is the URL to a YAML document</li>
          <li><code>query</code> is a <a href="https://jsonpath.com/">JSONPath</a> expression that will be used to query the document</li>
        </ul>
        Also an optional <code>prefix</code> and <code>suffix</code> may be supplied.
      </p>`,
      staticPreview: {
        message: '2',
      },
    },
  ]

  async fetch({ schema, url, errorMessages }) {
    return this._requestYaml({
      schema,
      url,
      errorMessages,
    })
  }
}
