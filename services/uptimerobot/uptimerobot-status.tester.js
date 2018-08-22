'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const isUptimeStatus = Joi.string().valid(
  'paused',
  'not checked yet',
  'up',
  'seems down',
  'down'
)
const { invalidJSON } = require('../response-fixtures')

const t = createServiceTester()
module.exports = t

t.create('Uptime Robot: Status (valid)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'status',
      value: isUptimeStatus,
    })
  )

t.create('Uptime Robot: Status (invalid, correct format)')
  .get('/m777777777-333333333333333333333333.json')
  .expectJSON({ name: 'status', value: 'api_key not found.' })

t.create('Uptime Robot: Status (invalid, incorrect format)')
  .get('/not-a-service.json')
  .expectJSON({ name: 'status', value: 'must use a monitor-specific api key' })

t.create('Uptime Robot: Status (unspecified error)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(200, '{"stat": "fail"}')
  )
  .expectJSON({ name: 'status', value: 'service error' })

t.create('Uptime Robot: Status (connection error)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .networkOff()
  .expectJSON({ name: 'status', value: 'inaccessible' })

t.create('Uptime Robot: Status (service unavailable)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(503, '{"error": "oh noes!!"}')
  )
  .expectJSON({ name: 'status', value: 'inaccessible' })

t.create('Uptime Robot: Status (unexpected response, valid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(200, '[]')
  )
  .expectJSON({ name: 'status', value: 'invalid json response' })

t.create('Uptime Robot: Status (unexpected response, invalid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'status', value: 'unparseable json response' })
