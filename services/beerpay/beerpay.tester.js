import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'beerpay',
  title: 'Beerpay',
})

t.create('no longer available (previously beerpay)')
  .get('/hashdog/scrapfy-chrome-extension.json')
  .expectBadge({
    label: 'beerpay',
    message: 'no longer available',
  })
