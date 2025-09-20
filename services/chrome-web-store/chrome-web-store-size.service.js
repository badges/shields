import { InvalidResponse, NotFound, pathParams } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

export default class ChromeWebStoreSize extends BaseChromeWebStoreService {
  static category = 'size'
  static route = { base: 'chrome-web-store/size', pattern: ':storeId' }

  static openApi = {
    '/chrome-web-store/size/{storeId}': {
      get: {
        summary: 'Chrome Web Store Size',
        parameters: pathParams({
          name: 'storeId',
          example: 'nccfelhkfpbnefflolffkclhenplhiab',
        }),
      },
    },
  }

  static defaultBadgeData = {
    label: 'extension size',
    color: 'blue',
  }

  static transform(sizeStr) {
    const match = sizeStr.match(/^(\d+(?:\.\d+)?)([a-zA-Z]+)$/)
    if (!match) {
      throw new InvalidResponse({
        prettyMessage: 'size does not match expected format',
      })
    }
    const [, size, units] = match
    return `${size} ${units}`
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const size = chromeWebStore.size()

    if (size == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }

    return { message: this.constructor.transform(size) }
  }
}
