'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isVPlusDottedVersionAtLeastOne } = require('../test-validators')

const isBowerPrereleaseVersion = Joi.string().regex(
  /^v\d+(\.\d+)?(\.\d+)?(-?[.\w\d])+?$/
)

const t = (module.exports = new ServiceTester({ id: 'bower', title: 'Bower' }))

t.create('licence')
  .get('/l/bootstrap.json')
  .expectJSON({ name: 'license', value: 'MIT' })

t.create('custom label for licence')
  .get('/l/bootstrap.json?label=my licence')
  .expectJSON({ name: 'my licence', value: 'MIT' })

t.create('license not declared')
  .get('/l/bootstrap.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/bower/bootstrap')
      .reply(200, { normalized_licenses: [] })
  )
  .expectJSON({ name: 'license', value: 'missing' })

t.create('version')
  .get('/v/bootstrap.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'bower',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('custom label for version')
  .get('/v/bootstrap.json?label=my version')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'my version',
      value: isVPlusDottedVersionAtLeastOne,
    })
  )

t.create('pre version') // e.g. bower|v0.2.5-alpha-rc-pre
  .get('/vpre/bootstrap.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'bower',
      value: isBowerPrereleaseVersion,
    })
  )

t.create('custom label for pre version') // e.g. pre version|v0.2.5-alpha-rc-pre
  .get('/vpre/bootstrap.json?label=pre version')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'pre version',
      value: isBowerPrereleaseVersion,
    })
  )

t.create('Version for Invaild Package')
  .get('/v/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'not found' })

t.create('Pre Version for Invaild Package')
  .get('/vpre/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'bower', value: 'not found' })

t.create('licence for Invaild Package')
  .get('/l/it-is-a-invalid-package-should-error.json')
  .expectJSON({ name: 'license', value: 'not found' })

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
