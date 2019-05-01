'use strict'

const libxmljs = require('libxmljs')
const { BaseService, InvalidResponse } = require('..')
const { renderDynamicBadge, errorMessages } = require('../dynamic-common')
const { createRoute } = require('./dynamic-helpers')

module.exports = class DynamicHtml extends BaseService {
  static get category() {
    return 'dynamic'
  }

  static get route() {
    return createRoute('html')
  }

  static get defaultBadgeData() {
    return {
      label: 'custom badge',
    }
  }

  async handle(namedParams, { url, query: pathExpression, prefix, suffix }) {
    // e.g. //book[2]/@id
    const pathIsAttr = (
      pathExpression.split('/').slice(-1)[0] || ''
    ).startsWith('@')

    const { buffer } = await this._request({
      url,
      options: {
        headers: {
          Accept: 'text/html, application/xhtml+xml',
        },
      },
      errorMessages,
    })

    const parsed = libxmljs.parseHtml(buffer, {
      nonet: true,
    })

    const values = (parsed.find(pathExpression) || []).map((node, i) =>
      pathIsAttr ? node.value() : node.child(0).text()
    )

    if (!values.length) {
      throw new InvalidResponse({ prettyMessage: 'no result' })
    }

    return renderDynamicBadge({ value: values, prefix, suffix })
  }
}
