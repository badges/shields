'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Localazy language progress with local name')
  .get('/floating-apps/pt_BR.json')
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
