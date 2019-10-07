'use strict'

const { DOMParser } = require('xmldom')
const xpath = require('xpath')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { createRoute } = require('./dynamic-helpers')
const { BaseService, InvalidResponse, InvalidParameter } = require('..')

// This service extends BaseService because it uses a different XML parser
// than BaseXmlService which can be used with xpath.
//
// One way to create a more performant version would be to use the BaseXml
// JSON parser and write the queries in jsonpath instead. Then eventually
// deprecate the old version.
module.exports = class DynamicXml extends BaseService {
  static get category() {
    return 'dynamic'
  }

  static get route() {
    return createRoute('xml')
  }

  static get defaultBadgeData() {
    return {
      label: 'custom badge',
    }
  }

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

    if (!Array.isArray(values)) {
      throw new InvalidResponse({
        prettyMessage: 'unsupported query',
      })
    }

    values = values.reduce((accum, node) => {
      if (pathIsAttr) {
        accum.push(node.value)
      } else if (node.firstChild) {
        accum.push(node.firstChild.data)
      }

      return accum
    }, [])

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
