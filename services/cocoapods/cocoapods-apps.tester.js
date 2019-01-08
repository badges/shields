'use strict'

const ServiceTester = require('../service-tester')
const t = (module.exports = new ServiceTester({
  id: 'CocoapodsApps',
  title: 'CocoapodsApps',
  pathPrefix: '/cocoapods',
}))

t.create('apps (valid, weekly)')
  .get('/aw/AFNetworking.json')
  .expectJSON({ name: 'apps', value: 'no longer available' })

t.create('apps (valid, total)')
  .get('/at/AFNetworking.json')
  .expectJSON({ name: 'apps', value: 'no longer available' })

t.create('apps (not found)')
  .get('/at/not-a-package.json')
  .expectJSON({ name: 'apps', value: 'no longer available' })
