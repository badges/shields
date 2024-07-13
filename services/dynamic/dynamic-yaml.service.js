import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseYamlService, queryParams } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

const description = `
The Dynamic YAML Badge allows you to extract an arbitrary value from any
YAML Document using a JSONPath selector and show it on a badge.
`

export default class DynamicYaml extends jsonPath(BaseYamlService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('yaml')
  static openApi = {
    '/badge/dynamic/yaml': {
      get: {
        summary: 'Dynamic YAML Badge',
        description,
        parameters: queryParams(
          {
            name: 'url',
            description: 'The URL to a YAML document',
            required: true,
            example:
              'https://raw.githubusercontent.com/badges/shields/master/.github/dependabot.yml',
          },
          {
            name: 'query',
            description:
              'A <a href="https://jsonpath.com/">JSONPath</a> expression that will be used to query the document',
            required: true,
            example: '$.version',
          },
          {
            name: 'prefix',
            description: 'Optional prefix to append to the value',
            example: '[',
          },
          {
            name: 'suffix',
            description: 'Optional suffix to append to the value',
            example: ']',
          },
        ),
      },
    },
  }

  async fetch({ schema, url, httpErrors }) {
    return this._requestYaml({
      schema,
      url,
      httpErrors,
      logErrors: [],
    })
  }
}
