'use strict'

const { currencyFromCode } = require('../text-formatters')
const BaseChromeWebStoreService = require('./chrome-web-store-base')

module.exports = class ChromeWebStorePrice extends BaseChromeWebStoreService {
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
    const { priceCurrency, price } = await this.fetch({ storeId })
    return this.constructor.render({ priceCurrency, price })
  }
}
