'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'JitpackDownloads',
  title: 'JitpackDownloads',
  pathPrefix: '/jitpack',
}))

t.create('no longer available (was weekly github')
  .get('/dw/github/erayerdin/kappdirs.json')
  .expectBadge({
    label: 'downloads',
    message: 'temporarily unavailable',
  })

t.create('no longer available (was monthly github')
  .get('/dm/github/erayerdin/kappdirs.json')
  .expectBadge({
    label: 'downloads',
    message: 'temporarily unavailable',
  })
