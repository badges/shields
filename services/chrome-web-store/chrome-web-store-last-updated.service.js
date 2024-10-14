import { age } from '../color-formatters.js'
import { formatDate } from '../text-formatters.js'
import { NotFound, pathParams } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

export default class ChromeWebStoreLastUpdated extends BaseChromeWebStoreService {
  static category = 'activity'
  static route = { base: 'chrome-web-store/last-updated', pattern: ':storeId' }

  static openApi = {
    '/chrome-web-store/last-updated/{storeId}': {
      get: {
        summary: 'Chrome Web Store Last Updated',
        parameters: pathParams({
          name: 'storeId',
          example: 'nccfelhkfpbnefflolffkclhenplhiab',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'extension last updated'
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const lastUpdated = chromeWebStore.lastUpdated()

    if (lastUpdated == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }

    const lastUpdatedDate = Date.parse(lastUpdated);

    return {
      message: formatDate(lastUpdatedDate),
      color: age(lastUpdatedDate),
    }
  }
}
