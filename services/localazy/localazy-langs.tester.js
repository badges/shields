'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('Localazy number of languages')
  .get('/floating-apps.json')
  .intercept(nock =>
    nock('https://connect.localazy.com')
      .get('/status/floating-apps/data')
      .query({ title: 'translated', content: 'langs' })
      .reply(200, {
        schemaVersion: 1,
        label: 'translated',
        message: '97 langs',
        color: '#066fef',
        style: 'flat',
        cacheSeconds: 3600,
      })
  )
  .expectBadge({
    label: 'translated',
    message: '97 langs',
    color: '#066fef',
  })
