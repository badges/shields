'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('existing key fingerprint')
  .get('/skyplabs.json')
  .expectJSONTypes(
    Joi.object({
      name: 'pgp',
      value: Joi.string()
        .hex()
        .length(16),
    })
  )

t.create('unknown username')
  .get('/skyplabsssssss.json')
  .expectJSONTypes(
    Joi.object({
      name: 'pgp',
      value: 'profile not found',
    })
  )

t.create('invalid username')
  .get('/s.json')
  .expectJSONTypes(
    Joi.object({
      name: 'pgp',
      value: 'invalid username',
    })
  )

t.create('missing key fingerprint')
  .get('/skyp.json')
  .expectJSONTypes(
    Joi.object({
      name: 'pgp',
      value: 'no key fingerprint found',
    })
  )
