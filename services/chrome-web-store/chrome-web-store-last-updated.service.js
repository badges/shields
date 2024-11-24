import { renderDateBadge } from '../date.js'
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
    label: 'last updated',
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const lastUpdated = chromeWebStore.lastUpdated()

    if (lastUpdated == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }

    return renderDateBadge(lastUpdated)
  }
}
