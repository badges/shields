'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const { isBuildStatus } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('CI status by ID')
  .get('/ci/559e33c8e982fc615500b357.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status by ID (with branch)')
  .get('/ci/559e33c8e982fc615500b357/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status (no builds yet)')
  .get('/ci/559e33c8e982fc615500b357.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3')
      .get('/runs?applicationId=559e33c8e982fc615500b357&limit=1')
      .reply(200, [])
  )
  .expectJSON({ name: 'build', value: 'no builds' })

t.create('Build status by name')
  .get('/build/wercker/go-wercker-api.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('Build status by name (with branch)')
  .get('/build/wercker/go-wercker-api/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('Build status (application not found)')
  .get('/build/some-project/that-doesnt-exist.json')
  .expectJSON({ name: 'build', value: 'application not found' })

t.create('Build status by name (private application)')
  .get('/build/wercker/blueprint.json')
  .expectJSON({ name: 'build', value: 'private application not supported' })
