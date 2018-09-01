'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const { isPercentage } = require('../test-validators')
const { invalidJSON } = require('../response-fixtures')

const t = createServiceTester()
module.exports = t

t.create('Uptime Robot: Percentage (valid)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'uptime',
      value: isPercentage,
    })
  )

t.create('Uptime Robot: Percentage (valid, with numberOfDays param)')
  .get('/7/m778918918-3e92c097147760ee39d02d36.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'uptime',
      value: isPercentage,
    })
  )

t.create('Uptime Robot: Percentage (invalid, correct format)')
  .get('/m777777777-333333333333333333333333.json')
  .expectJSON({ name: 'uptime', value: 'api_key not found.' })

t.create('Uptime Robot: Percentage (invalid, incorrect format)')
  .get('/not-a-service.json')
  .expectJSON({ name: 'uptime', value: 'must use a monitor-specific api key' })

t.create('Uptime Robot: Percentage (unspecified error)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(200, '{"stat": "fail"}')
  )
  .expectJSON({ name: 'uptime', value: 'service error' })

t.create('Uptime Robot: Percentage (connection error)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .networkOff()
  .expectJSON({ name: 'uptime', value: 'inaccessible' })

t.create('Uptime Robot: Percentage (service unavailable)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(503, '{"error": "oh noes!!"}')
  )
  .expectJSON({ name: 'uptime', value: 'inaccessible' })

t.create('Uptime Robot: Percentage (unexpected response, valid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(200, '[]')
  )
  .expectJSON({ name: 'uptime', value: 'invalid response data' })

t.create('Uptime Robot: Percentage (unexpected response, invalid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'uptime', value: 'unparseable json response' })
