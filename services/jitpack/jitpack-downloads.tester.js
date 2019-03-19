'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const isMetric = /^.*\/(week|month)/

t.create('weekly')
  .get('/dw/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('monthly')
  .get('/dm/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('unknown package')
  .get('/dw/some-bogus-user/project.json')
  .expectBadge({
    label: 'downloads',
    message: 'project not found or private',
  })
