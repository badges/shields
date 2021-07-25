import Joi from 'joi'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isCorrectStatus = Joi.string().valid(
  'up',
  'issues',
  'down',
  'maintenance'
)

t.create('PingPong: Status (valid)')
  .get('/sp_eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'status', message: isCorrectStatus })

t.create('PingPong: Status (valid, incorrect format)')
  .get('/eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'status', message: 'invalid api key' })

t.create('PingPong: Status (unexpected response)')
  .get('/sp_key.json')
  .intercept(
    nock =>
      nock('https://api.pingpong.one')
        .get('/widget/shields/status/sp_key')
        .reply(200, '{"status": "up"}') // unexpected status message
  )
  .expectBadge({ label: 'status', message: 'Unknown status received' })
