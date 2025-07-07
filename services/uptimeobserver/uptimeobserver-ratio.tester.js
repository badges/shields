import { createServiceTester } from '../tester.js'
import { isPercentage } from '../test-validators.js'

export const t = await createServiceTester()

t.create('UptimeObserver uptime ratio 30 days (mock)')
  .get('/30/94e1d60553b1425ab2a276128f3bca7466.json')
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
    label: 'uptime',
    message: '97.8%',
    color: 'brightgreen',
  })

t.create('UptimeObserver uptime ratio 30 days')
  .get('/30/33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41.json')
  .expectBadge({
    label: 'uptime',
    message: isPercentage,
  })

t.create('UptimeObserver uptime ratio 7 days (mock)')
  .get('/7/94e1d60553b1425ab2a276128f3bca7466.json')
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
    label: 'uptime',
    message: '98.2%',
    color: 'brightgreen',
  })

t.create('UptimeObserver uptime ratio 7 days')
  .get('/7/33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41.json')
  .expectBadge({
    label: 'uptime',
    message: isPercentage,
  })

t.create('UptimeObserver uptime ratio 24h (mock)')
  .get('/1/94e1d60553b1425ab2a276128f3bca7466.json')
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
    label: 'uptime',
    message: '99.5%',
    color: 'brightgreen',
  })

t.create('UptimeObserver uptime ratio 24h')
  .get('/1/33Zw1rnH6veb4OLcskqvj6g9Lj4tnyxZ41.json')
  .expectBadge({
    label: 'uptime',
    message: isPercentage,
  })
