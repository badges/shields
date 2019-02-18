'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('existing zcash address')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'zec',
      value: withRegex(/^(?!not found$)/),
    })
  )

t.create('unknown username')
  .get('/skyplabsssssss.json')
  .expectJSONTypes(
    Joi.object({
      name: 'zec',
      value: 'profile not found',
    })
  )

t.create('invalid username')
  .get('/s.json')
  .expectJSONTypes(
    Joi.object({
      name: 'zec',
      value: 'invalid username',
    })
  )

t.create('missing zcash address')
  .get('/test.json')
  .expectJSONTypes(
    Joi.object({
      name: 'zec',
      value: 'no zcash addresses found',
    })
  )
