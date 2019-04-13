'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Security Rating')
  .get('/https/sonarcloud.io/com.luckybox:luckybox/security_rating.json')
  .expectBadge({
    label: 'security rating',
    message: isMetric,
    color: 'blue',
  })
