'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isStarRating } = require('../test-validators')

const t = new ServiceTester({
  id: 'spiget',
  title: 'SpigetStars',
})
module.exports = t

t.create('EssentialsX (id 9089)')
  .get('/stars/9089.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: isStarRating,
    })
  )

t.create('Invalid Resource (id 1)')
  .get('/stars/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: 'not found',
    })
  )
