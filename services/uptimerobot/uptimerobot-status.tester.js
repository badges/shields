import Joi from 'joi'
import { invalidJSON } from '../response-fixtures.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isUptimeStatus = Joi.string().valid(
  'paused',
  'not checked yet',
  'up',
  'seems down',
  'down'
)

t.create('Uptime Robot: Status (valid)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .expectBadge({
    label: 'status',
    message: isUptimeStatus,
  })

t.create('Uptime Robot: Status (invalid, correct format)')
  .get('/m777777777-333333333333333333333333.json')
  .expectBadge({ label: 'status', message: 'api_key not found.' })

t.create('Uptime Robot: Status (invalid, incorrect format)')
  .get('/not-a-service.json')
  .expectBadge({
    label: 'status',
    message: 'must use a monitor-specific api key',
  })

t.create('Uptime Robot: Status (unspecified error)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(200, '{"stat": "fail"}')
  )
  .expectBadge({ label: 'status', message: 'service error' })

t.create('Uptime Robot: Status (service unavailable)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(503, '{"error": "oh noes!!"}')
  )
  .expectBadge({ label: 'status', message: 'inaccessible' })

t.create('Uptime Robot: Status (unexpected response, valid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com').post('/v2/getMonitors').reply(200, '[]')
  )
  .expectBadge({ label: 'status', message: 'invalid response data' })

t.create('Uptime Robot: Status (unexpected response, invalid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(invalidJSON)
  )
  .expectBadge({ label: 'status', message: 'unparseable json response' })
