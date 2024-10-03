import { createServiceTester } from '../tester.js'
import { isMetricWithPattern } from '../test-validators.js'

export const t = await createServiceTester()

t.create('gets status for shields')
  .get('/308323056592486420.json')
  .expectBadge({
    label: 'chat',
    message: isMetricWithPattern(/ online/),
    color: 'brightgreen',
  })

t.create('invalid server ID')
  .get('/12345.json')
  .expectBadge({ label: 'chat', message: 'invalid server' })

t.create('widget disabled')
  .get('/12345.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v6/guilds/12345/widget.json')
      .reply(403, {
        code: 50004,
        message: 'Widget Disabled',
      }),
  )
  .expectBadge({ label: 'chat', message: 'widget disabled' })

t.create('server error')
  .get('/12345.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v6/guilds/12345/widget.json')
      .reply(500, 'Something broke'),
  )
  .expectBadge({ label: 'chat', message: 'inaccessible' })
