'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = new ServiceTester({ id: 'sourceforge', title: 'SourceForge' })
module.exports = t

t.create('total downloads')
  .get('/dt/sevenzip.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('monthly downloads')
  .get('/dm/sevenzip.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('weekly downloads')
  .get('/dw/sevenzip.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('daily downloads')
  .get('/dd/sevenzip.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('invalid project')
  .get('/dd/invalid.json')
  .expectBadge({
    label: 'downloads',
    message: 'invalid',
  })

t.create('total downloads (connection error)')
  .get('/dt/sevenzip.json')
  .networkOff()
  .expectBadge({
    label: 'downloads',
    message: 'inaccessible',
  })
