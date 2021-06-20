import { currencyFromCode } from '../text-formatters.js'
import { NotFound } from '../index.js'
import BaseChromeWebStoreService from './chrome-web-store-base.js'

export default class ChromeWebStorePrice extends BaseChromeWebStoreService {
  static category = 'funding'
  static route = { base: 'chrome-web-store/price', pattern: ':storeId' }

  static examples = [
    {
      title: 'Chrome Web Store',
      namedParams: { storeId: 'ogffaloegjglncjfehdfplabnoondfjo' },
      staticPreview: this.render({ priceCurrency: 'USD', price: 0 }),
    },
  ]

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
