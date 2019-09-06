'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())

const isQualityGateStatus = Joi.allow('passed', 'failed')

t.create('Quality Gate')
  .get(
    '/quality_gate/swellaby%3Aazdo-shellcheck.json?server=https://sonarcloud.io'
  )
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })

t.create('Quality Gate (Alert Status)')
  .get(
    '/alert_status/org.ow2.petals%3Apetals-se-ase.json?server=http://sonar.petalslink.com&sonarVersion=4.2'
  )
  .expectBadge({
    label: 'quality gate',
    message: isQualityGateStatus,
  })
