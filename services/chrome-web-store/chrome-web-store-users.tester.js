'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store',
  title: 'Chrome Web Store Users',
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
