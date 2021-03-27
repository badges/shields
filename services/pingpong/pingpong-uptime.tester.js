'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

// Example matches: 87.33%, 100%, 51%
const isCorrectMessage = Joi.string().pattern(new RegExp(/\b(?<!\.)(?!0+(?:\.0+)?%)(?:\d|[1-9]\d|100)(?:(?<!100)\.\d+)?%/))

t.create('PingPong: Uptime (valid)')
  .get('/sp_eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'uptime', message: isCorrectMessage })

t.create('PingPong: Uptime (invalid, incorrect format)')
  .get('/not-a-real-api-key.json')
  .expectBadge({ label: 'uptime', message: 'invalid api key' })

t.create('PingPong: Uptime (valid, incorrect format)')
  .get('/eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'uptime', message: 'invalid api key' })

t.create('PingPong: Uptime (backend error)')
  .get('/sp_key.json')
  .intercept(nock =>
    nock('https://api.pingpong.one')
      .get('/widget/badge/uptime/sp_key')
      .reply(503, '')
  )
  .expectBadge({ label: 'uptime', message: 'inaccessible' })

t.create('PingPong: Uptime (unexpected response, valid json)')
  .get('/sp_key.json')
  .intercept(nock =>
    nock('https://api.pingpong.one')
    .get('/widget/badge/uptime/sp_key')
    .reply(200, '[]')
  )
  .expectBadge({ label: 'uptime', message: 'invalid response data' })

t.create('PingPong: Uptime (unexpected response, missing json values)')
  .get('/sp_key.json')
  .intercept(nock =>
    nock('https://api.pingpong.one')
    .get('/widget/badge/uptime/sp_key')
    .reply(200, '{"message": "up"}') // no color key
  )
  .expectBadge({ label: 'uptime', message: 'invalid response data' })
