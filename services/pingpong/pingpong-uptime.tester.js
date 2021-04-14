'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

// Example matches: 87.33%, 100%, 51%
const isCorrectMessage = Joi.string().pattern(
  /\b(?<!\.)(?!0+(?:\.0+)?%)(?:\d|[1-9]\d|100)(?:(?<!100)\.\d+)?%/
)

t.create('PingPong: Uptime (valid)')
  .get('/sp_eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'uptime', message: isCorrectMessage })

t.create('PingPong: Uptime (valid, incorrect format)')
  .get('/eb705b7c189f42e3b574dc790291c33f.json')
  .expectBadge({ label: 'uptime', message: 'invalid api key' })

t.create('PingPong: Uptime (unexpected response)')
  .get('/sp_key.json')
  .intercept(
    nock =>
      nock('https://api.pingpong.one')
        .get('/widget/shields/uptime/sp_key')
        .reply(200, '{"uptime": "hundred"}') // value should be a number
  )
  .expectBadge({ label: 'uptime', message: 'invalid response data' })
