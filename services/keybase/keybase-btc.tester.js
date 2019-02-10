'use strict'

const Joi = require('joi')

const t = (module.exports = require('../tester').createServiceTester())

t.create('existing bitcoin address')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'btc',
      value: Joi.string(),
    })
  )

t.create('unknown username')
  .get('/skyplabsssssss.json')
  .expectJSONTypes(
    Joi.object({
      name: 'btc',
      value: 'not found',
    })
  )
