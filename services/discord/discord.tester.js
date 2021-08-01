import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('gets status for Reactiflux')
  .get('/102860784329052160.json')
  .expectBadge({
    label: 'chat',
    message: Joi.string().regex(/^[0-9]+ online$/),
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
      })
  )
  .expectBadge({ label: 'chat', message: 'widget disabled' })

t.create('server error')
  .get('/12345.json')
  .intercept(nock =>
    nock('https://discord.com/')
      .get('/api/v6/guilds/12345/widget.json')
      .reply(500, 'Something broke')
  )
  .expectBadge({ label: 'chat', message: 'inaccessible' })
