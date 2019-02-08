'use strict'

const Joi = require('joi')
const { isVPlusTripleDottedVersion } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('package version')
  .get('/v/box2d.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pub',
      value: isVPlusTripleDottedVersion,
    })
  )

t.create('package pre-release version')
  .get('/vpre/box2d.json')
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
    value: 'not found',
  })
