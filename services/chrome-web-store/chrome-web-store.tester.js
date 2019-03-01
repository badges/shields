'use strict'

const Joi = require('joi')
const {
  isVPlusDottedVersionAtLeastOne,
  isStarRating,
  isMetric,
} = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'chrome-web-store',
  title: 'Chrome Web Store',
}))

t.create('Downloads (now users)')
  .get('/d/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Version')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'chrome web store',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Version - Custom label')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json?label=IndieGala Helper')
  .expectBadge({
    label: 'IndieGala Helper',
    message: isVPlusDottedVersionAtLeastOne,
  })

t.create('Rating')
  .get('/rating/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({
    label: 'rating',
    message: Joi.string().regex(/^\d\.?\d+?\/5$/),
  })

t.create('Stars')
  .get('/stars/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectBadge({ label: 'rating', message: isStarRating })

t.create('Invalid addon')
  .get('/d/invalid-name-of-addon.json')
  .expectBadge({ label: 'chrome web store', message: 'invalid' })

t.create('No connection')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectBadge({ label: 'chrome web store', message: 'inaccessible' })
