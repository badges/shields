'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('licence')
  .timeout(10000)
  .get('/bootstrap.json')
  .expectJSON({ name: 'license', value: 'MIT' })

t.create('license not declared')
  .timeout(10000)
  .get('/bootstrap.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/bower/bootstrap')
      .reply(200, { normalized_licenses: [] })
  )
  .expectJSON({ name: 'license', value: 'missing' })
