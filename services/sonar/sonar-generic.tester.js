'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Security Rating')
  .get(
    '/com.luckybox:luckybox/security_rating.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })
