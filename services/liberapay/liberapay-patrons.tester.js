'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Patrons (valid)').get('/Liberapay.json').expectBadge({
  label: 'patrons',
  message: isMetric,
})

t.create('Patrons (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })
