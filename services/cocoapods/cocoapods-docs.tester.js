'use strict'

const Joi = require('joi')
const { isIntegerPercentage } = require('../test-validators')

const t = (module.exports = require('../tester').createServiceTester())

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
