import { renderVersionBadge } from '../version.js'
import { NotFound } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

export default class ChromeWebStoreVersion extends BaseChromeWebStoreService {
  static category = 'version'
  static route = { base: 'chrome-web-store/v', pattern: ':storeId' }

  static examples = [
    {
      title: 'Chrome Web Store',
      namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
      staticPreview: renderVersionBadge({ version: 'v1.1.0' }),
    },
  ]

  static defaultBadgeData = { label: 'chrome web store' }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const version = chromeWebStore.version()
    if (version == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return renderVersionBadge({ version })
  }
}
