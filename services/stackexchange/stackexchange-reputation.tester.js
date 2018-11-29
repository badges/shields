'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = require('../create-service-tester')()
module.exports = t

t.create('Invalid parameters')
  .get('/stackoverflow/invalidimage.json')
  .expectJSON({ name: 'stackoverflow', value: 'invalid parameters' })

t.create('Reputation for StackOverflow user 22656')
  .get('/stackoverflow/22656.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow reputation',
      value: isMetric,
    })
  )

t.create('Reputation for Tex user 22656')
  .get('/tex/226.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tex reputation',
      value: isMetric,
    })
  )
