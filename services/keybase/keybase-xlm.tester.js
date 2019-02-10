'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('existing stellar address')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'xlm',
      value: withRegex(/^(?!not found$)/),
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
