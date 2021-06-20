import { metric } from '../text-formatters.js'
import { downloadCount } from '../color-formatters.js'
import { redirector, NotFound } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

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

export { ChromeWebStoreDownloads, ChromeWebStoreUsers }
