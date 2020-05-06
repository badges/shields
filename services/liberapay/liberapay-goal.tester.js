'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Goal Progress (valid)').get('/Liberapay.json').expectBadge({
  label: 'goal progress',
  message: isIntegerPercentage,
})

t.create('Goal Progress (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })
