'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Localazy language progress with locale')
  .get('/floating-apps/pt_BR.json')
  .intercept(nock =>
    nock('https://connect.localazy.com')
      .get('/status/floating-apps/data')
      .query({ title: 'lang-code', content: 'pt_BR' })
      .reply(200, {
        schemaVersion: 1,
        label: 'pt_BR',
        message: '61%',
        color: '#066fef',
        style: 'flat',
        cacheSeconds: 3600,
      })
  )
  .expectBadge({
    label: 'pt_BR',
    message: '61%',
    color: '#066fef',
  })

t.create('Localazy language progress in English')
  .get('/floating-apps/pt_BR.json?locale_display=en')
  .intercept(nock =>
    nock('https://connect.localazy.com')
      .get('/status/floating-apps/data')
      .query({ title: 'lang-name', content: 'pt_BR' })
      .reply(200, {
        schemaVersion: 1,
        label: 'Brazilian Portuguese',
        message: '61%',
        color: '#066fef',
        style: 'flat',
        cacheSeconds: 3600,
      })
  )
  .expectBadge({
    label: 'Brazilian Portuguese',
    message: '61%',
    color: '#066fef',
  })

t.create('Localazy language progress with localized name')
  .get('/floating-apps/pt_BR.json?locale_display=loc')
  .intercept(nock =>
    nock('https://connect.localazy.com')
      .get('/status/floating-apps/data')
      .query({ title: 'lang-loc-name', content: 'pt_BR' })
      .reply(200, {
        schemaVersion: 1,
        label: 'Português (BR)',
        message: '61%',
        color: '#066fef',
        style: 'flat',
        cacheSeconds: 3600,
      })
  )
  .expectBadge({
    label: 'Português (BR)',
    message: '61%',
    color: '#066fef',
  })
