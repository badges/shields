'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Players').get('/1.json').expectBadge({
  label: 'players',
  message: isMetric,
})
