'use strict'

const { invalidJSON } = require('../response-fixtures')

const t = (module.exports = require('../create-service-tester')())

t.create('license (valid)')
  .get('/AFNetworking.json')
  .expectJSON({ name: 'license', value: 'MIT' })

t.create('license (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'license', value: 'not found' })

t.create('license (connection error)')
  .get('/AFNetworking.json')
  .networkOff()
  .expectJSON({ name: 'license', value: 'inaccessible' })

t.create('license (unexpected response)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://trunk.cocoapods.org')
      .get('/api/v1/pods/AFNetworking/specs/latest')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'license', value: 'invalid' })
