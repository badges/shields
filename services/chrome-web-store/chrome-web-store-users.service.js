'use strict'

const { metric } = require('../text-formatters')
const { downloadCount } = require('../color-formatters')
const BaseChromeWebStoreService = require('./chrome-web-store-base')
const { redirector, NotFound } = require('..')

class ChromeWebStoreUsers extends BaseChromeWebStoreService {
  static get category() {
    return 'downloads'
  }

  static get route() {
    return {
      base: 'chrome-web-store/users',
      pattern: ':storeId',
    }
  }

  static get examples() {
    return [
      {
        title: 'Chrome Web Store',
        namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
        staticPreview: this.render({ downloads: 573 }),
      },
    ]
  }

  static get defaultBadgeData() {
    return { label: 'users' }
  }

  static render({ downloads }) {
    return {
      message: `${metric(downloads)}`,
      color: downloadCount(downloads),
    }
  }

  async handle({ storeId }) {
    const data = await this.fetch({ storeId })
    if (!data.interactionCount || !data.interactionCount.UserDownloads) {
      throw new NotFound({ prettyMessage: 'count not found' })
    }
    return this.constructor.render({
      downloads: data.interactionCount.UserDownloads,
    })
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
