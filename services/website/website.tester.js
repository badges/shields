'use strict'

const t = (module.exports = require('../create-service-tester')())

t.create('status of http://shields.io')
  .get('/website/http/shields.io.json?style=_shields_test')
  .expectJSON({ name: 'website', value: 'online', color: 'brightgreen' })

t.create('status of https://shields.io')
  .get('/website/https/shields.io.json?style=_shields_test')
  .expectJSON({ name: 'website', value: 'online', color: 'brightgreen' })

t.create('status of nonexistent domain')
  .get('/website/https/shields-io.io.json?style=_shields_test')
  .expectJSON({ name: 'website', value: 'offline', color: 'red' })

t.create('status when network is off')
  .get('/website/http/shields.io.json?style=_shields_test')
  .networkOff()
  .expectJSON({ name: 'website', value: 'offline', color: 'red' })

t.create('custom online label, online message and online color')
  .get(
    '/website-up-down-green-grey/http/online.com.json?style=_shields_test&label=homepage'
  )
  .intercept(nock =>
    nock('http://online.com')
      .head('/')
      .reply(200)
  )
  .expectJSON({ name: 'homepage', value: 'up', color: 'green' })

t.create('custom offline message and offline color')
  .get('/website-up-down-green-grey/http/offline.com.json?style=_shields_test')
  .intercept(nock =>
    nock('http://offline.com')
      .head('/')
      .reply(500)
  )
  .expectJSON({ name: 'website', value: 'down', color: 'grey' })
