'use strict'

const Joi = require('joi')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const isBowerPrereleaseVersion = Joi.string().regex(
  /^v\d+(\.\d+)?(\.\d+)?(-?[.\w\d])+?$/
)

t.create('version')
  .timeout(10000)
  .get('/v/bootstrap.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'bower',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('pre version') // e.g. bower|v0.2.5-alpha-rc-pre
  .timeout(10000)
  .get('/vpre/bootstrap.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'bower',
      value: isBowerPrereleaseVersion,
    })
  )

t.create('Version for Invalid Package')
  .timeout(10000)
  .get('/v/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'package not found' })

t.create('Pre Version for Invalid Package')
  .timeout(10000)
  .get('/vpre/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'package not found' })

t.create('Version label should be `no releases` if no stable version')
  .get('/v/bootstrap.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/bower/bootstrap')
      .reply(200, { normalized_licenses: [], latest_stable_release: null })
  )
  .expectJSON({ name: 'bower', value: 'no releases' })

t.create('Version label should be `no releases` if no pre-release')
  .get('/vpre/bootstrap.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/bower/bootstrap')
      .reply(200, { normalized_licenses: [], latest_release_number: null })
  )
  .expectJSON({ name: 'bower', value: 'no releases' })
