'use strict'

const Joi = require('joi')

const isPlatform = Joi.string().regex(
  /^(osx|ios|tvos|watchos)( \| (osx|ios|tvos|watchos))*$/
)

const t = (module.exports = require('../tester').createServiceTester())

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

t.create('platform (missing platforms key)')
  .get('/AFNetworking.json')
  .intercept(nock =>
    nock('https://trunk.cocoapods.org')
      .get('/api/v1/pods/AFNetworking/specs/latest')
      .reply(200, { version: 'v1.0', license: 'MIT' })
  )
  .expectJSON({ name: 'platform', value: 'ios | osx' })
