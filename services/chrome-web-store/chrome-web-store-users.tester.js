'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'ChromeWebStoreUsers',
  title: 'Chrome Web Store Users',
  pathPrefix: '/chrome-web-store',
}))

t.create('Downloads (redirect)')
  .get('/d/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/users/invalid-name-of-addon.json')
  .expectBadge({ label: 'users', message: 'not found' })

// Keep this "inaccessible" test, since this service does not use BaseService#_request.
t.create('Users (inaccessible)')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'users', message: 'inaccessible' })
