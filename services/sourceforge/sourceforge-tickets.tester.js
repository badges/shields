'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('bugs')
  .get('/bugs/sevenzip.json')
  .expectBadge({
    label: 'open tickets',
    message: isMetric,
  })
  .timeout(10000)

t.create('feature requests')
  .get('/feature-requests/sevenzip.json')
  .expectBadge({
    label: 'open tickets',
    message: isMetric,
  })
  .timeout(10000)

t.create('invalid project')
  .get('/bugs/invalid.json')
  .expectBadge({
    label: 'open tickets',
    message: 'project not found',
  })
