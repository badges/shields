'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { isBuildStatus } = require('../test-validators')
const { colorScheme } = require('../test-helpers')

const t = createServiceTester()
module.exports = t

t.create('Build status')
  .get('/build/wercker/go-wercker-api.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('Build status (with branch)')
  .get('/build/wercker/go-wercker-api/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('Build status (application not found)')
  .get('/build/some-project/that-doesnt-exist.json')
  .expectJSON({ name: 'build', value: 'application not found' })

t.create('Build status (private application)')
  .get('/build/wercker/blueprint.json')
  .expectJSON({ name: 'build', value: 'private application not supported' })

t.create('Build passed (mocked)')
  .get('/build/wercker/go-wercker-api.json?style=_shields_test')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(200, [{ status: 'finished', result: 'passed' }])
  )
  .expectJSON({
    name: 'build',
    value: 'passing',
    colorB: colorScheme.brightgreen,
  })

t.create('Build failed (mocked)')
  .get('/build/wercker/go-wercker-api.json?style=_shields_test')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3/applications/')
      .get('/wercker/go-wercker-api/builds?limit=1')
      .reply(200, [{ status: 'finished', result: 'failed' }])
  )
  .expectJSON({ name: 'build', value: 'failed', colorB: colorScheme.red })

t.create('CI status by ID')
  .get('/ci/559e33c8e982fc615500b357.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status by ID (with branch)')
  .get('/ci/559e33c8e982fc615500b357/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status by ID (no runs yet)')
  .get('/ci/559e33c8e982fc615500b357.json')
  .intercept(nock =>
    nock('https://app.wercker.com/api/v3')
      .get('/runs?applicationId=559e33c8e982fc615500b357&limit=1')
      .reply(200, [])
  )
  .expectJSON({ name: 'build', value: 'no builds' })
