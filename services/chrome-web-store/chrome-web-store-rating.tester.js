'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'ChromeWebStoreRating',
  title: 'Chrome Web Store Rating',
  pathPrefix: '/chrome-web-store',
}))

t.create('Rating')
  .get('/rating/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'no longer available' })

t.create('Rating Count')
  .get('/rating-count/invalid-name-of-addon.json')
  .expectBadge({ label: 'rating', message: 'no longer available' })

t.create('Stars')
  .get('/stars/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'rating', message: 'no longer available' })
