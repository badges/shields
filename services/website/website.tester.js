'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('status of http://shields.io')
  .get('/website.json?url=http://shields.io')
  .expectBadge({ label: 'website', message: 'up', color: 'brightgreen' })

t.create('status of https://shields.io')
  .get('/website.json?url=https://shields.io')
  .expectBadge({ label: 'website', message: 'up', color: 'brightgreen' })

t.create('status of nonexistent domain')
  .get('/website.json?url=http://shields.io.io')
  .expectBadge({ label: 'website', message: 'down', color: 'red' })

t.create('status when network is off')
  .get('/website.json?url=http://shields.io')
  .networkOff()
  .expectBadge({ label: 'website', message: 'down', color: 'red' })

t.create('custom online label, online message and online color')
  .get(
    '/website.json?url=http://online.com&up_message=up&down_message=down&up_color=green&down_color=grey'
  )
  .intercept(nock =>
    nock('http://online.com')
      .head('/')
      .reply(200)
  )
  .expectBadge({ label: 'website', message: 'up', color: 'green' })

t.create('custom offline message and offline color')
  .get(
    '/website.json?url=http://offline.com&up_message=up&down_message=down&up_color=green&down_color=grey'
  )
  .intercept(nock =>
    nock('http://offline.com')
      .head('/')
      .reply(500)
  )
  .expectBadge({ label: 'website', message: 'down', color: 'grey' })
