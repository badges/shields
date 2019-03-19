'use strict'

const t = (module.exports = require('../tester').createServiceTester())

const isMetric = /^.*\/(week|month)/

t.create('weekly')
  .get('/erayerdin/kappdirs/dw.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('monthly')
  .get('/erayerdin/kappdirs/dm.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('unknown package')
  .get('/some-bogus-user/project/dw.json')
  .expectBadge({
    label: 'downloads',
    message: 'project not found or private',
  })
