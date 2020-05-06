'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'packagecontrol',
  title: 'Package Control',
}))

t.create('monthly downloads').get('/dm/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('weekly downloads').get('/dw/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('daily downloads').get('/dd/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetricOverTimePeriod,
})

t.create('total downloads').get('/dt/GitGutter.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('package not found').get('/dt/does-not-exist.json').expectBadge({
  label: 'downloads',
  message: 'not found',
})
