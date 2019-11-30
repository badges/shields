'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('bugs')
  .get('/sevenzip/bugs.json')
  .expectBadge({
    label: 'open tickets',
    message: isMetric,
  })
  .timeout(10000)

t.create('feature requests')
  .get('/sevenzip/feature-requests.json')
  .expectBadge({
    label: 'open tickets',
    message: isMetric,
  })
  .timeout(10000)

t.create('invalid project')
  .get('/invalid/bugs.json')
  .expectBadge({
    label: 'open tickets',
    message: 'project not found',
  })
