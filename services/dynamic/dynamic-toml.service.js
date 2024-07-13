import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseTomlService, queryParams } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

const description = `
The Dynamic TOML Badge allows you to extract an arbitrary value from any
TOML Document using a JSONPath selector and show it on a badge.
`

export default class DynamicToml extends jsonPath(BaseTomlService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('toml')
  static openApi = {
    '/badge/dynamic/toml': {
      get: {
        summary: 'Dynamic TOML Badge',
        description,
        parameters: queryParams(
          {
            name: 'url',
            description: 'The URL to a TOML document',
            required: true,
            example:
              'https://raw.githubusercontent.com/squirrelchat/smol-toml/mistress/bench/testfiles/toml-spec-example.toml',
          },
          {
            name: 'query',
            description:
              'A <a href="https://jsonpath.com/">JSONPath</a> expression that will be used to query the document',
            required: true,
            example: '$.title',
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
    return this._requestToml({
      schema,
      url,
      httpErrors,
      logErrors: [],
    })
  }
}
