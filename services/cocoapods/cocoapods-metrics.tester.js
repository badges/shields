'use strict'

const Joi = require('joi')
const { invalidJSON } = require('../response-fixtures')
const { isIntegerPercentage } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('doc percent (valid)')
  .get('/AFNetworking.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docs',
      value: isIntegerPercentage,
    })
  )

t.create('doc percent (null)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://metrics.cocoapods.org')
      .get('/api/v1/pods/AFNetworking')
      .reply(200, '{"cocoadocs": {"doc_percent": null}}')
  )
  .expectJSON({ name: 'docs', value: '0%' })

t.create('doc percent (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'docs', value: 'not found' })

t.create('doc percent (connection error)')
  .get('/AFNetworking.json')
  .networkOff()
  .expectJSON({ name: 'docs', value: 'inaccessible' })

t.create('doc percent (unexpected response)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://metrics.cocoapods.org')
      .get('/api/v1/pods/AFNetworking')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'docs', value: 'invalid' })
