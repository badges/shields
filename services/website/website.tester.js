'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('status of http://shields.io')
  .get('/http/shields.io.json')
  .expectBadge({ label: 'website', message: 'up', color: 'brightgreen' })

t.create('status of https://shields.io')
  .get('/https/shields.io.json')
  .expectBadge({ label: 'website', message: 'up', color: 'brightgreen' })

t.create('status of nonexistent domain')
  .get('/https/shields-io.io.json')
  .expectBadge({ label: 'website', message: 'down', color: 'red' })

t.create('status when network is off')
  .get('/http/shields.io.json')
  .networkOff()
  .expectBadge({ label: 'website', message: 'down', color: 'red' })

t.create('custom online label, online message and online color')
  .get(
    '/http/online.com.json?up_message=up&down_message=down&up_color=green&down_color=grey'
  )
  .intercept(nock =>
    nock('http://online.com')
      .head('/')
      .reply(200)
  )
  .expectBadge({ label: 'website', message: 'up', color: 'green' })

t.create('custom offline message and offline color')
  .get(
    '/http/offline.com.json?up_message=up&down_message=down&up_color=green&down_color=grey'
  )
  .intercept(nock =>
    nock('http://offline.com')
      .head('/')
      .reply(500)
  )
  .expectBadge({ label: 'website', message: 'down', color: 'grey' })
