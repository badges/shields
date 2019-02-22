'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Invalid parameters')
  .get('/stackoverflow/r/invalidimage.json')
  .expectJSON({ name: 'stackoverflow', value: 'invalid parameters' })

t.create('Reputation for StackOverflow user 22656')
  .get('/stackoverflow/r/22656.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow reputation',
      value: isMetric,
    })
  )

t.create('Reputation for Tex user 22656')
  .get('/tex/r/226.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tex reputation',
      value: isMetric,
    })
  )
