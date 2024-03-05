import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'ChromeWebStorePrice',
  title: 'ChromeWebStorePrice',
  pathPrefix: '/chrome-web-store/price',
})

t.create('Price').get('/alhjnofcnnpeaphgeakdhkebafjcpeae.json').expectBadge({
  label: 'price',
  message: 'no longer available',
})
