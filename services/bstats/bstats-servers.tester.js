'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Servers').get('/1.json').expectBadge({
  label: 'servers',
  message: isMetric,
})
