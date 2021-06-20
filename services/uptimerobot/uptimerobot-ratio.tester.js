import { isPercentage } from '../test-validators.js'
import { invalidJSON } from '../response-fixtures.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Uptime Robot: Percentage (valid)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .expectBadge({
    label: 'uptime',
    message: isPercentage,
  })

t.create('Uptime Robot: Percentage (valid, with numberOfDays param)')
  .get('/7/m778918918-3e92c097147760ee39d02d36.json')
  .expectBadge({
    label: 'uptime',
    message: isPercentage,
  })

t.create('Uptime Robot: Percentage (invalid, correct format)')
  .get('/m777777777-333333333333333333333333.json')
  .expectBadge({ label: 'uptime', message: 'api_key not found.' })

t.create('Uptime Robot: Percentage (invalid, incorrect format)')
  .get('/not-a-service.json')
  .expectBadge({
    label: 'uptime',
    message: 'must use a monitor-specific api key',
  })

t.create('Uptime Robot: Percentage (unspecified error)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(200, '{"stat": "fail"}')
  )
  .expectBadge({ label: 'uptime', message: 'service error' })

t.create('Uptime Robot: Percentage (service unavailable)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(503, '{"error": "oh noes!!"}')
  )
  .expectBadge({ label: 'uptime', message: 'inaccessible' })

t.create('Uptime Robot: Percentage (unexpected response, valid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com').post('/v2/getMonitors').reply(200, '[]')
  )
  .expectBadge({ label: 'uptime', message: 'invalid response data' })

t.create('Uptime Robot: Percentage (unexpected response, invalid json)')
  .get('/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock =>
    nock('https://api.uptimerobot.com')
      .post('/v2/getMonitors')
      .reply(invalidJSON)
  )
  .expectBadge({ label: 'uptime', message: 'unparseable json response' })
