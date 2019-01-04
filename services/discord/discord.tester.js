'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = (module.exports = new ServiceTester({
  id: 'discord',
  title: 'Discord',
}))

t.create('gets status for Reactiflux')
  .get('/102860784329052160.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'chat',
      value: Joi.string().regex(/^[0-9]+ online$/),
      colorB: '#4c1',
    })
  )

t.create('invalid server ID')
  .get('/12345.json')
  .expectJSON({ name: 'chat', value: 'invalid server' })

t.create('widget disabled')
  .get('/12345.json')
  .intercept(nock =>
    nock('https://discordapp.com/')
      .get('/api/guilds/12345/widget.json')
      .reply(403, {
        code: 50004,
        message: 'Widget Disabled',
      })
  )
  .expectJSON({ name: 'chat', value: 'widget disabled' })

t.create('server error')
  .get('/12345.json')
  .intercept(nock =>
    nock('https://discordapp.com/')
      .get('/api/guilds/12345/widget.json')
      .reply(500, 'Something broke')
  )
  .expectJSON({ name: 'chat', value: 'inaccessible' })

t.create('connection error')
  .get('/102860784329052160.json')
  .networkOff()
  .expectJSON({ name: 'chat', value: 'inaccessible' })
