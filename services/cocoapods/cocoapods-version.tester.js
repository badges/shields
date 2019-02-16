'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

t.create('version (valid)')
  .get('/AFNetworking.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pod',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('version (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'pod', value: 'not found' })
