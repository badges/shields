'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isMetric } = require('../test-validators')

const t = new ServiceTester({ id: 'stackexchange', title: 'StackExchange' })

module.exports = t

t.create('Invalid t parameter')
  .get('/stackoverflow/t/invalidimage.json')
  .expectJSON({ name: 'stackoverflow', value: 'invalid' })

t.create('Invalid r parameter')
  .get('/stackoverflow/r/invalidimage.json')
  .expectJSON({ name: 'stackoverflow', value: 'invalid' })

t.create('JavaScript Questions')
  .get('/stackoverflow/t/javascript.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow javascript questions',
      value: isMetric,
    })
  )

t.create('Reputation for user 22656')
  .get('/stackoverflow/r/22656.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'stackoverflow reputation',
      value: isMetric,
    })
  )

t.create('No connection')
  .get('/stackoverflow/r/22656.json')
  .networkOff()
  .expectJSON({ name: 'stackoverflow', value: 'inaccessible' })

t.create('Hit IP Rate Limit')
  .get('/stackoverflow/r/22656.json')
  .intercept(nock =>
    nock('https://api.stackexchange.com/2.2/')
      .get('/users/22656?site=stackoverflow')
      .reply(429, [{ error_name: 'throttle_violation' }])
  )
  .expectJSON({ name: 'stackoverflow', value: 'invalid' })
