'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('dependent count')
  .get('/npm/got.json')
  .expectBadge({
    label: 'dependents',
    message: isMetric,
  })

t.create('dependent count (nonexistent package)')
  .get('/npm/foobar-is-not-package.json')
  .timeout(10000)
  .expectBadge({
    label: 'dependents',
    message: 'package not found',
  })
