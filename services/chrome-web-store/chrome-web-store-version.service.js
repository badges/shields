import { renderVersionBadge } from '../version.js'
import { NotFound, pathParams } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

export default class ChromeWebStoreVersion extends BaseChromeWebStoreService {
  static category = 'version'
  static route = { base: 'chrome-web-store/v', pattern: ':storeId' }

  static openApi = {
    '/chrome-web-store/v/{storeId}': {
      get: {
        summary: 'Chrome Web Store Version',
        parameters: pathParams({
          name: 'storeId',
          example: 'ogffaloegjglncjfehdfplabnoondfjo',
        }),
      },
    },
  }

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
