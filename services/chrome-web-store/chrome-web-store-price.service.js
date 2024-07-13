import { deprecatedService } from '../index.js'

const ChromeWebStorePrice = deprecatedService({
  category: 'funding',
  route: { base: 'chrome-web-store/price', pattern: ':storeId' },
  label: 'price',
  dateAdded: new Date('2024-02-18'),
})

export default ChromeWebStorePrice
