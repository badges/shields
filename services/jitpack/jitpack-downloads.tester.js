'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const isMetric = /^.*\/(week|month)/

t.create('weekly (github only)')
  .get('/dw/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('monthly (github only)')
  .get('/dm/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('weekly (groupId)')
  .get('/dw/com.github.erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('monthly (groupId)')
  .get('/dm/com.github.erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('unknown package (github only)')
  .get('/dw/some-bogus-user/project.json')
  .expectBadge({
    label: 'downloads',
    message: 'project not found or private',
  })

t.create('unknown package (groupId)')
  .get('/dw/com.github.some-bogus-user/project.json')
  .expectBadge({
    label: 'downloads',
    message: 'project not found or private',
  })
