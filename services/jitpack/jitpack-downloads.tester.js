'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetricOverTimePeriod } = require('../test-validators')

t.create('weekly (github)')
  .get('/dw/github/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('monthly (github)')
  .get('/dm/github/erayerdin/kappdirs.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('unknown package (github)')
  .get('/dw/github/some-bogus-user/project.json')
  .expectBadge({
    label: 'downloads',
    message: 'project not found or private',
  })
