'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const { invalidJSON } = require('../response-fixtures')

const t = (module.exports = require('../create-service-tester')())

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

t.create('version (connection error)')
  .get('/AFNetworking.json')
  .networkOff()
  .expectJSON({ name: 'pod', value: 'inaccessible' })

t.create('version (unexpected response)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://trunk.cocoapods.org')
      .get('/api/v1/pods/AFNetworking/specs/latest')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'pod', value: 'invalid' })
