'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('existing bitcoin address')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'btc',
      value: withRegex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/),
    })
  )

t.create('unknown username')
  .get('/skyplabsssssss.json')
  .expectJSONTypes(
    Joi.object({
      name: 'btc',
      value: 'profile not found',
    })
  )

t.create('invalid username')
  .get('/s.json')
  .expectJSONTypes(
    Joi.object({
      name: 'btc',
      value: 'invalid username',
    })
  )

t.create('missing bitcoin address')
  .get('/test.json')
  .expectJSONTypes(
    Joi.object({
      name: 'btc',
      value: 'no bitcoin addresses found',
    })
  )
