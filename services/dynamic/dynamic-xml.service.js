'use strict'

const { DOMParser } = require('xmldom')
const xpath = require('xpath')
const BaseService = require('../base')
const { InvalidResponse } = require('../errors')
const {
  createRoute,
  queryParamSchema,
  errorMessages,
  renderDynamicBadge,
} = require('./dynamic-helpers')

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

  async handle(namedParams, queryParams) {
    const {
      url,
      query: pathExpression,
      prefix,
      suffix,
    } = this.constructor._validateQueryParams(queryParams, queryParamSchema)

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

    return renderDynamicBadge({ values, prefix, suffix })
  }
}
