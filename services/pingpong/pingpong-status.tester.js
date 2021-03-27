'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const isCorrectStatus = Joi.string().valid(
  'up',
  'issues',
  'down',
  'maintenance',
)

t.create('PingPong: Status (valid)')
  .get('/sp_eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'status', message: isCorrectStatus })

t.create('PingPong: Status (invalid, incorrect format)')
  .get('/not-a-real-api-key.json')
  .expectBadge({ label: 'status', message: 'invalid api key' })

t.create('PingPong: Status (valid, incorrect format)')
  .get('/eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'status', message: 'invalid api key' })

t.create('PingPong: Status (backend error)')
  .get('/sp_key.json')
  .intercept(nock =>
    nock('https://api.pingpong.one')
      .get('/widget/badge/status/sp_key')
      .reply(503, '')
  )
  .expectBadge({ label: 'status', message: 'inaccessible' })

t.create('PingPong: Status (unexpected response, valid json)')
  .get('/sp_key.json')
  .intercept(nock =>
    nock('https://api.pingpong.one')
    .get('/widget/badge/status/sp_key')
    .reply(200, '[]')
  )
  .expectBadge({ label: 'status', message: 'invalid response data' })

t.create('PingPong: Status (unexpected response, missing json values)')
  .get('/sp_key.json')
  .intercept(nock =>
    nock('https://api.pingpong.one')
    .get('/widget/badge/status/sp_key')
    .reply(200, '{"message": "up"}') // no color key
  )
  .expectBadge({ label: 'status', message: 'invalid response data' })
