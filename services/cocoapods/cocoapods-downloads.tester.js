'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'CocoapodsDownloads',
  title: 'CocoapodsDownloads',
  pathPrefix: '/cocoapods',
}))

t.create('downloads (valid, monthly)')
  .get('/dm/AFNetworking.json')
  .expectBadge({ label: 'downloads', message: 'no longer available' })

t.create('downloads (valid, weekly)')
  .get('/dw/AFNetworking.json')
  .expectBadge({ label: 'downloads', message: 'no longer available' })

t.create('downloads (valid, total)')
  .get('/dt/AFNetworking.json')
  .expectBadge({ label: 'downloads', message: 'no longer available' })

t.create('downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'no longer available' })
