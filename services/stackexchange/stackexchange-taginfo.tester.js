'use strict'

const Joi = require('joi')
const { isMetric } = require('../test-validators')
const t = require('../create-service-tester')()
module.exports = t

t.create('JavaScript Questions')
  .get('/stackoverflow/t/javascript.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow javascript questions',
      value: isMetric,
    })
  )

t.create('Tex Programming Questions')
  .get('/tex/t/programming.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tex programming questions',
      value: isMetric,
    })
  )
