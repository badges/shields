import { currencyFromCode } from '../text-formatters.js'
import { NotFound, pathParams } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

export default class ChromeWebStorePrice extends BaseChromeWebStoreService {
  static category = 'funding'
  static route = { base: 'chrome-web-store/price', pattern: ':storeId' }

  static openApi = {
    '/chrome-web-store/price/{storeId}': {
      get: {
        summary: 'Chrome Web Store Price',
        parameters: pathParams({
          name: 'storeId',
          example: 'ogffaloegjglncjfehdfplabnoondfjo',
        }),
      },
    },
  }

  static defaultBadgeData = { label: 'price' }

  static render({ priceCurrency, price }) {
    return {
      message: `${currencyFromCode(priceCurrency) + price}`,
      color: 'brightgreen',
    }
  }

  async handle({ storeId }) {
    const chromeWebStore = await this.fetch({ storeId })
    const priceCurrency = chromeWebStore.priceCurrency()
    const price = chromeWebStore.price()
    if (priceCurrency == null || price == null) {
      throw new NotFound({ prettyMessage: 'not found' })
    }
    return this.constructor.render({ priceCurrency, price })
  }
}
