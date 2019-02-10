'use strict'

const Joi = require('joi')

const t = (module.exports = require('../tester').createServiceTester())

t.create('existing fingerprint')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'pgp',
      value: Joi.string()
        .hex()
        .length(16),
    })
  )

t.create('unknown username')
  .get('/skyplabsssssss.json')
  .expectJSONTypes(
    Joi.object({
      name: 'pgp',
      value: 'not found',
    })
  )
