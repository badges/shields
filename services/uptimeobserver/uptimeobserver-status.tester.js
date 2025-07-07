import Joi from 'joi'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

const isUptimeStatus = Joi.string().valid('up', 'down')

t.create('UptimeObserver status (mock)')
  .get('/94e1d60553b1425ab2a276128f3bca7466.json')
  .intercept(nock =>
    nock('https://app.uptimeobserver.com')
      .get('/api/monitor/status/94e1d60553b1425ab2a276128f3bca7466')
      .reply(200, {
        status: 'UP',
        friendlyName: 'Test Monitor',
        lastExecution: '2025-06-04T18:17:06.171106Z',
        uptime24h: 99.5,
        uptime7d: 98.2,
        uptime30d: 97.8,
      }),
  )
  .expectBadge({
    label: 'status',
    message: 'up',
    color: 'brightgreen',
  })

t.create('UptimeObserver uptime status (known monitor)')
  .get('/33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41.json')
  .expectBadge({
    label: 'status',
    message: isUptimeStatus,
  })

t.create('UptimeObserver uptime status (not found)')
  .get('/aae1d60553b1425ab2a276128f3bca7466.json')
  .expectBadge({
    label: 'status',
    message: 'not found',
  })

t.create('UptimeObserver uptime status (unvalid key)')
  .get('/aae1d60553b1425ab2a.json')
  .expectBadge({
    label: 'status',
    message: 'monitor API key is unvalid',
  })

t.create('UptimeObserver status DOWN (mock)')
  .get('/94e1d60553b1425ab2a276128f3bca7466.json')
  .intercept(nock =>
    nock('https://app.uptimeobserver.com')
      .get('/api/monitor/status/94e1d60553b1425ab2a276128f3bca7466')
      .reply(200, {
        status: 'DOWN',
        friendlyName: 'Test Monitor Down',
        lastExecution: '2025-06-04T18:17:06.171106Z',
        uptime24h: 85.0,
        uptime7d: 88.2,
        uptime30d: 92.1,
      }),
  )
  .expectBadge({
    label: 'status',
    message: 'down',
    color: 'red',
  })
