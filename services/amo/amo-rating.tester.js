'use strict'

const Joi = require('joi')
const { isStarRating } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('Rating')
  .get('/rating/IndieGala-Helper.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: Joi.string().regex(/^\d\/\d$/),
    })
  )

t.create('Stars')
  .get('/stars/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({ name: 'stars', value: isStarRating }))

t.create('Rating (not found)')
  .get('/rating/not-a-real-plugin.json')
  .expectJSON({ name: 'mozilla add-on', value: 'not found' })
