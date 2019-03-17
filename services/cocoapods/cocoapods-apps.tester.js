'use strict'

const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'CocoapodsApps',
  title: 'CocoapodsApps',
  pathPrefix: '/cocoapods',
}))

t.create('apps (valid, weekly)')
  .get('/aw/AFNetworking.json')
  .expectBadge({ label: 'apps', message: 'no longer available' })

t.create('apps (valid, total)')
  .get('/at/AFNetworking.json')
  .expectBadge({ label: 'apps', message: 'no longer available' })

t.create('apps (not found)')
  .get('/at/not-a-package.json')
  .expectBadge({ label: 'apps', message: 'no longer available' })
