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
