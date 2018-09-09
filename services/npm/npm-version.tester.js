'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { isSemver } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('gets the package version of left-pad')
  .get('/left-pad.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets the package version of left-pad from a custom registry')
  .get('/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets the package version of @cycle/core')
  .get('/@cycle/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets a tagged package version of npm')
  .get('/npm/next.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@next', value: isSemver }))

t.create('gets the correct tagged package version of npm')
  .intercept(nock =>
    nock('https://registry.npmjs.org')
      .get('/-/package/npm/dist-tags')
      .reply(200, { latest: '1.2.3', next: '4.5.6' })
  )
  .get('/npm/next.json')
  .expectJSON({ name: 'npm@next', value: 'v4.5.6' })

t.create('returns an error for version with an invalid tag')
  .get('/npm/frodo.json')
  .expectJSON({ name: 'npm', value: 'tag not found' })

t.create('gets the package version of left-pad from a custom registry')
  .get('/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }))

t.create('gets the tagged package version of @cycle/core')
  .get('/@cycle/core/canary.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }))

t.create(
  'gets the tagged package version of @cycle/core from a custom registry'
)
  .get('/@cycle/core/canary.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }))

t.create('invalid package name')
  .get('/frodo-is-not-a-package.json')
  .expectJSON({ name: 'npm', value: 'package not found' })
