'use strict'

const Joi = require('joi')
const { invalidJSON } = require('../response-fixtures')

const isPlatform = Joi.string().regex(
  /^(osx|ios|tvos|watchos)( \| (osx|ios|tvos|watchos))*$/
)

const t = (module.exports = require('../create-service-tester')())

t.create('platform (valid)')
  .get('/AFNetworking.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'platform',
      value: isPlatform,
    })
  )

t.create('platform (not found)')
  .get('/not-a-package.json')
  .expectJSON({ name: 'platform', value: 'not found' })

t.create('platform (connection error)')
  .get('/AFNetworking.json')
  .networkOff()
  .expectJSON({ name: 'platform', value: 'inaccessible' })

t.create('platform (unexpected response)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://trunk.cocoapods.org')
      .get('/api/v1/pods/AFNetworking/specs/latest')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'platform', value: 'invalid' })
