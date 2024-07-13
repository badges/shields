import { MetricNames } from '../../core/base-service/metric-helper.js'
import { BaseJsonService, queryParams } from '../index.js'
import { createRoute } from './dynamic-helpers.js'
import jsonPath from './json-path.js'

const description = `
The Dynamic JSON Badge allows you to extract an arbitrary value from any
JSON Document using a JSONPath selector and show it on a badge.
`

export default class DynamicJson extends jsonPath(BaseJsonService) {
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('json')
  static openApi = {
    '/badge/dynamic/json': {
      get: {
        summary: 'Dynamic JSON Badge',
        description,
        parameters: queryParams(
          {
            name: 'url',
            description: 'The URL to a JSON document',
            required: true,
            example:
              'https://github.com/badges/shields/raw/master/package.json',
          },
          {
            name: 'query',
            description:
              'A <a href="https://jsonpath.com/">JSONPath</a> expression that will be used to query the document',
            required: true,
            example: '$.name',
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
    return this._requestJson({
      schema,
      url,
      httpErrors,
      logErrors: [],
    })
  }
}
