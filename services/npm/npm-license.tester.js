'use strict'

const Joi = require('joi')

const t = (module.exports = require('../tester').createServiceTester())

t.create('gets the license of express')
  .get('/express.json')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: 'MIT' }))

t.create('gets the license of express from a custom registry')
  .get('/express.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: 'MIT' }))

t.create('public domain license')
  .get('/redux-auth.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'WTFPL', color: '#7cd958' })

t.create('copyleft license')
  .get('/trianglify.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'GPL-3.0', color: 'orange' })

t.create('permissive license')
  .get('/express.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', color: 'green' })

t.create('permissive license for scoped package')
  .get('/@cycle%2Fcore.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', color: 'green' })

t.create(
  'permissive and copyleft licenses (SPDX license expression syntax version 2.0)'
)
  .get('/rho-cc-promise.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: '(MPL-2.0 OR MIT)',
    color: 'lightgrey',
  })

t.create('license for package without a license property')
  .get('/package-without-license.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-without-license/latest')
      .reply(200, {
        name: 'package-without-license',
        maintainers: [],
      })
  )
  .expectJSON({ name: 'license', value: 'missing', color: 'red' })

t.create('license for package with a license object')
  .get('/package-license-object.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-license-object/latest')
      .reply(200, {
        name: 'package-license-object',
        license: {
          type: 'MIT',
          url: 'https://www.opensource.org/licenses/mit-license.php',
        },
        maintainers: [],
      })
  )
  .expectJSON({ name: 'license', value: 'MIT', color: 'green' })

t.create('license for package with a license array')
  .get('/package-license-array.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/package-license-array/latest')
      .reply(200, {
        name: 'package-license-object',
        license: ['MPL-2.0', 'MIT'],
        maintainers: [],
      })
  )
  .expectJSON({
    name: 'license',
    value: 'MPL-2.0, MIT',
    color: 'green',
  })

t.create('license for unknown package')
  .get('/npm-registry-does-not-have-this-package.json?style=_shields_test')
  .expectJSON({
    name: 'license',
    value: 'package not found',
    color: 'red',
  })

// This tests error-handling functionality in NpmBase.
t.create('when json is malformed for scoped package')
  .get('/@cycle%2Fcore.json')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/@cycle%2Fcore')
      .reply(200, {
        'dist-tags': {
          latest: '1.2.3',
        },
        versions: null,
      })
  )
  .expectJSON({
    name: 'license',
    value: 'invalid json response',
  })
