'use strict'

const { renderVersionBadge } = require('../version')
const BaseChromeWebStoreService = require('./chrome-web-store-base')

module.exports = class ChromeWebStoreVersion extends BaseChromeWebStoreService {
  static get category() {
    return 'version'
  }

  static get route() {
    return {
      base: 'chrome-web-store/v',
      pattern: ':storeId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chrome Web Store',
        namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
        staticPreview: renderVersionBadge({ version: 'v1.1.0' }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'chrome web store' }
  }

  async handle({ storeId }) {
    const data = await this.fetch({ storeId })
    return renderVersionBadge({ version: data.version })
  }
}
