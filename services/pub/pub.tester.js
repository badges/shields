'use strict'

const Joi = require('joi')
const { ServiceTester } = require('..')
const { isVPlusTripleDottedVersion } = require('../test-validators')

const t = (module.exports = new ServiceTester({ id: 'pub', title: 'Pub' }))

t.create('package version')
  .get('/v/box2d.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pub',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('package not found')
  .get('/v/does-not-exist.json')
  .expectJSON({
    name: 'pub',
    value: 'invalid',
  })
