'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isQualityGateStatus = Joi.allow('passed', 'failed')

t.create('Quality Gate')
  .get('/https/sonarcloud.io/swellaby%3Aazdo-shellcheck/quality_gate.json')
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })

t.create('Quality Gate (Alert Status)')
  .get(
    '/http/sonar.petalslink.com/org.ow2.petals%3Apetals-se-ase/alert_status.json?sonarVersion=4.2'
  )
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })
