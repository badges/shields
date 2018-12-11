'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const {
  isVPlusDottedVersionAtLeastOne,
  isStarRating,
  isMetric,
} = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store',
  title: 'Chrome Web Store',
}))

t.create('Downloads (now users)')
  .get('/d/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({ name: 'users', value: isMetric }))

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({ name: 'users', value: isMetric }))

t.create('Version')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'chrome web store',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Version - Custom label')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json?label=IndieGala Helper')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'IndieGala Helper',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('Rating')
  .get('/rating/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'rating',
      value: Joi.string().regex(/^\d\.?\d+?\/5$/),
    })
  )

t.create('Stars')
  .get('/stars/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({ name: 'rating', value: isStarRating }))

t.create('Invalid addon')
  .get('/d/invalid-name-of-addon.json')
  .expectJSON({ name: 'chrome web store', value: 'invalid' })

t.create('No connection')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectJSON({ name: 'chrome web store', value: 'inaccessible' })
