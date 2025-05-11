import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'Coincap',
  title: 'Coincap',
  pathPrefix: '/coincap',
})

t.create('coincap change percent 24hr')
  .get('/change-percent-24hr/bitcoin.json')
  .expectBadge({
    label: 'coincap',
    message: 'no longer available',
  })

t.create('coincap price USD').get('/price-usd/bitcoin.json').expectBadge({
  label: 'coincap',
  message: 'no longer available',
})

t.create('coincap rank').get('/rank/bitcoin.json').expectBadge({
  label: 'coincap',
  message: 'no longer available',
})
