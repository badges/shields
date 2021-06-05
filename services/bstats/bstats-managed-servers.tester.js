'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Managed Servers').get('/11269.json').expectBadge({
  label: 'managed servers',
  message: isMetric,
})
