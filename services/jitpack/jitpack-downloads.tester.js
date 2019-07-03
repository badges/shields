'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isMetricOverTimePeriod } = require('../test-validators')

t.create('weekly (github)')
  .get('/dw/github/jitpack/maven-simple.json')
  .timeout(10000)
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('monthly (github)')
  .get('/dm/github/dcendents/android-maven-gradle-plugin.json')
  .timeout(10000)
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('unknown package (github)')
  .get('/dw/github/some-bogus-user/super-fake-project.json')
  .timeout(10000)
  .expectBadge({
    label: 'downloads',
    message: '0/week',
  })
