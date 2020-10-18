'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const { redirector, NotFound } = require('..')
const BaseChromeWebStoreService = require('./chrome-web-store-base')

class ChromeWebStoreUsers extends BaseChromeWebStoreService {
  static category = 'downloads'
  static route = { base: 'chrome-web-store/users', pattern: ':storeId' }

  static examples = [
    {
      title: 'Chrome Web Store',
      namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
      staticPreview: this.render({ downloads: 573 }),
    },
  ]

  static defaultBadgeData = { label: 'users' }

  static render({ downloads }) {
    return {
      message: `${metric(downloads)}`,
      color: downloadCount(downloads),
    }
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const downloads = chromeWebStore.users()
    if (downloads == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ downloads })
  }
}

const ChromeWebStoreDownloads = redirector({
  category: 'downloads',
  route: {
    base: 'chrome-web-store/d',
    pattern: ':storeId',
  },
  transformPath: ({ storeId }) => `/chrome-web-store/users/${storeId}`,
  dateAdded: new Date('2019-02-27'),
})

module.exports = {
  ChromeWebStoreDownloads,
  ChromeWebStoreUsers,
}
