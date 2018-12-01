'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusTripleDottedVersion } = require('../test-validators')

const t = new ServiceTester({ id: 'pub', title: 'Pub' })
module.exports = t

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
