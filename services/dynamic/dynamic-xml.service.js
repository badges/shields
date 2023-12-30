import { DOMParser } from '@xmldom/xmldom'
import xpath from 'xpath'
import { MetricNames } from '../../core/base-service/metric-helper.js'
import { renderDynamicBadge, httpErrors } from '../dynamic-common.js'
import {
  BaseService,
  InvalidResponse,
  InvalidParameter,
  queryParams,
} from '../index.js'
import { createRoute } from './dynamic-helpers.js'

const description = `
The Dynamic XML Badge allows you to extract an arbitrary value from any
XML Document using an XPath selector and show it on a badge.

Useful resources for constructing XPath selectors:
- [XPather](http://xpather.com/)
- [XPath Cheat Sheet](https://devhints.io/xpath/)

Note: For XML documents that use a default namespace prefix, you will need to use the
[local-name](https://developer.mozilla.org/en-US/docs/Web/XPath/Functions/local-name)
function to construct your query.
For example \`/*[local-name()='myelement']\` rather than \`/myelement\`.
`

// This service extends BaseService because it uses a different XML parser
// than BaseXmlService which can be used with xpath.
//
// One way to create a more performant version would be to use the BaseXml
// JSON parser and write the queries in jsonpath instead. Then eventually
// deprecate the old version.
export default class DynamicXml extends BaseService {
  static category = 'dynamic'
  static enabledMetrics = [MetricNames.SERVICE_RESPONSE_SIZE]
  static route = createRoute('xml')
  static openApi = {
    '/badge/dynamic/xml': {
      get: {
        summary: 'Dynamic XML Badge',
        description,
        parameters: queryParams(
          {
            name: 'url',
            description: 'The URL to a XML document',
            required: true,
            example: 'https://httpbin.org/xml',
          },
          {
            name: 'query',
            description:
              'An XPath expression that will be used to query the document',
            required: true,
            example: '//slideshow/slide[1]/title',
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

  static defaultBadgeData = { label: 'custom badge' }

  transform({ pathExpression, buffer }) {
    // e.g. //book[2]/@id
    const pathIsAttr = (
      pathExpression.split('/').slice(-1)[0] || ''
    ).startsWith('@')
    const parsed = new DOMParser().parseFromString(buffer)

    let values
    try {
      values = xpath.select(pathExpression, parsed)
    } catch (e) {
      throw new InvalidParameter({ prettyMessage: e.message })
    }

    if (
      typeof values === 'string' ||
      typeof values === 'number' ||
      typeof values === 'boolean'
    ) {
      values = [values]
    } else if (Array.isArray(values)) {
      values = values.reduce((accum, node) => {
        if (pathIsAttr) {
          accum.push(node.value)
        } else if (node.firstChild) {
          accum.push(node.firstChild.data)
        } else {
          accum.push(node.data)
        }

        return accum
      }, [])
    } else {
      throw new InvalidResponse({
        prettyMessage: 'unsupported query',
      })
    }

    if (!values.length) {
      throw new InvalidResponse({ prettyMessage: 'no result' })
    }

    return { values }
  }

  async handle(_namedParams, { url, query: pathExpression, prefix, suffix }) {
    const { buffer } = await this._request({
      url,
      options: { headers: { Accept: 'application/xml, text/xml' } },
      httpErrors,
      logErrors: [],
    })

    const { values: value } = this.transform({
      pathExpression,
      buffer,
    })

    return renderDynamicBadge({ value, prefix, suffix })
  }
}
