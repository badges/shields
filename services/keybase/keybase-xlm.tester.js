'use strict'

const Joi = require('joi')

const t = (module.exports = require('../tester').createServiceTester())

t.create('existing stellar address')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'xlm',
      value: Joi.string(),
    })
  )

t.create('unknown username')
  .get('/skyplabsssssss.json')
  .expectJSONTypes(
    Joi.object({
      name: 'xlm',
      value: 'not found',
    })
  )
