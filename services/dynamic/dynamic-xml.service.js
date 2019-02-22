'use strict'

const { DOMParser } = require('xmldom')
const xpath = require('xpath')
const { BaseService, InvalidResponse } = require('..')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { createRoute } = require('./dynamic-helpers')

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

  async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
    const pathIsAttr = pathExpression.includes('@')

    const { buffer } = await this._request({
      url,
      options: { headers: { Accept: 'application/xml, text/xml' } },
      errorMessages,
    })

    const parsed = new DOMParser().parseFromString(buffer)

    const values = xpath
      .select(pathExpression, parsed)
      .map((node, i) => (pathIsAttr ? node.value : node.firstChild.data))

    if (!values.length) {
      throw new InvalidResponse({ prettyMessage: 'no result' })
    }

    return renderDynamicBadge({ value: values, prefix, suffix })
  }
}
