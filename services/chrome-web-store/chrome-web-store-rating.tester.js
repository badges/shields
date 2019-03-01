'use strict'

const Joi = require('joi')
const { isStarRating } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store',
  title: 'Chrome Web Store Rating',
}))

t.create('Rating')
  .get('/rating/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: Joi.string().regex(/^\d\.?\d+?\/5$/),
    })
  )

t.create('Rating (not found)')
  .get('/rating/invalid-name-of-addon.json')
  .expectJSON({ name: 'rating', value: 'not found' })

t.create('Rating Count')
  .get('/rating-count/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: Joi.string().regex(/^\d+?\stotal$/),
    })
  )

t.create('Rating Count (not found)')
  .get('/rating-count/invalid-name-of-addon.json')
  .expectJSON({ name: 'rating', value: 'not found' })

t.create('Stars')
  .get('/stars/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({ name: 'rating', value: isStarRating }))

t.create('Stars (not found)')
  .get('/stars/invalid-name-of-addon.json')
  .expectJSON({ name: 'rating', value: 'not found' })
