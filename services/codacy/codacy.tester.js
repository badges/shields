'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isIntegerPercentage } = require('../test-validators')
const isCodacyGrade = Joi.equal('A', 'B', 'C', 'D', 'E', 'F')

const t = new ServiceTester({ id: 'codacy', title: 'Codacy' })
module.exports = t

t.create('Coverage')
  .get('/coverage/59d607d0e311408885e418004068ea58.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('Coverage unknown')
  .get('/coverage/e27821fb6289410b8f58338c7e0bc686.json')
  .expectJSON({
    name: 'coverage',
    value: 'unknown',
  })

t.create('Coverage on branch')
  .get('/coverage/59d607d0e311408885e418004068ea58/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('Code qualiy')
  .get('/grade/e27821fb6289410b8f58338c7e0bc686.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: isCodacyGrade,
    })
  )

t.create('Code qualiy on branch')
  .get('/grade/e27821fb6289410b8f58338c7e0bc686/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'code quality',
      value: isCodacyGrade,
    })
  )
