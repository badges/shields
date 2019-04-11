'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const isMetric = /^.*\/(week|month)/

t.create('weekly (github)')
  .get('/dw/github/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('monthly (github)')
  .get('/dm/github/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('unknown package (github)')
  .get('/dw/github/some-bogus-user/project.json')
  .expectBadge({
    label: 'downloads',
    message: 'project not found or private',
  })
