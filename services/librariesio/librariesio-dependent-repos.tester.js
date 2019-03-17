'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('dependent repo count')
  .get('/npm/got.json')
  .expectBadge({
    label: 'dependent repos',
    message: isMetric,
  })

t.create('dependent repo count (not a package)')
  .get('/npm/foobar-is-not-package.json')
  .timeout(10000)
  .expectBadge({
    label: 'dependent repos',
    message: 'package not found',
  })
