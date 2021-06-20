import { DOMParser } from 'xmldom'
import xpath from 'xpath'
import { MetricNames } from '../../core/base-service/metric-helper.js'
import { renderDynamicBadge, errorMessages } from '../dynamic-common.js'
import { BaseService, InvalidResponse, InvalidParameter } from '../index.js'
import { createRoute } from './dynamic-helpers.js'

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
      errorMessages,
    })

    const { values: value } = this.transform({
      pathExpression,
      buffer,
    })

    return renderDynamicBadge({ value, prefix, suffix })
  }
}
