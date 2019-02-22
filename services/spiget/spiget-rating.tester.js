'use strict'

const Joi = require('joi')
const { isStarRating, withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Stars - EssentialsX (id 9089)')
  .get('/stars/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Stars - Invalid Resource (id 1)')
  .get('/stars/1.json')
  .expectJSON({
    name: 'rating',
    value: 'not found',
  })

t.create('Rating - EssentialsX (id 9089)')
  .get('/rating/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: withRegex(/^(\d*\.\d+)(\/5 \()(\d+)(\))$/),
    })
  )

t.create('Rating - Invalid Resource (id 1)')
  .get('/rating/1.json')
  .expectJSON({
    name: 'rating',
    value: 'not found',
  })
