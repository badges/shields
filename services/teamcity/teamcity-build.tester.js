'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')
const {
  mockTeamCityCreds,
  pass,
  user,
  restore,
} = require('./teamcity-test-helpers')

const buildStatusValues = Joi.equal('passing', 'failure', 'error').required()
const buildStatusTextRegex = /^success|failure|error|tests( failed: \d+( \(\d+ new\))?)?(,)?( passed: \d+)?(,)?( ignored: \d+)?(,)?( muted: \d+)?$/

const t = (module.exports = require('../tester').createServiceTester())

t.create('live: codebetter unknown build')
  .get('/codebetter/btabc.json')
  .expectJSON({ name: 'build', value: 'build not found' })

t.create('live: codebetter known build')
  .get('/codebetter/IntelliJIdeaCe_JavaDecompilerEngineTests.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: buildStatusValues,
    })
  )

t.create('live: simple status for known build')
  .get('/https/teamcity.jetbrains.com/s/bt345.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: buildStatusValues,
    })
  )

t.create('live: full status for known build')
  .get('/https/teamcity.jetbrains.com/e/bt345.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: withRegex(buildStatusTextRegex),
    })
  )

t.create('codebetter success build')
  .get('/codebetter/bt123.json?style=_shields_test')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt123)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Success',
      })
  )
  .expectJSON({
    name: 'build',
    value: 'passing',
    color: 'brightgreen',
  })

t.create('codebetter failure build')
  .get('/codebetter/bt123.json?style=_shields_test')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt123)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'FAILURE',
        statusText: 'Tests failed: 2',
      })
  )
  .expectJSON({
    name: 'build',
    value: 'failure',
    color: 'red',
  })

t.create('simple build status with passed build')
  .get('/https/myteamcity.com:8080/s/bt321.json?style=_shields_test')
  .intercept(nock =>
    nock('https://myteamcity.com:8080/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt321)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Tests passed: 100',
      })
  )
  .expectJSON({
    name: 'build',
    value: 'passing',
    color: 'brightgreen',
  })

t.create('simple build status with failed build')
  .get('/https/myteamcity.com:8080/s/bt999.json?style=_shields_test')
  .intercept(nock =>
    nock('https://myteamcity.com:8080/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt999)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'FAILURE',
        statusText: 'Tests failed: 10 (2 new)',
      })
  )
  .expectJSON({
    name: 'build',
    value: 'failure',
    color: 'red',
  })

t.create('full build status with passed build')
  .get('/https/selfhosted.teamcity.com:4000/e/bt321.json?style=_shields_test')
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com:4000/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt321)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Tests passed: 100, ignored: 3',
      })
  )
  .expectJSON({
    name: 'build',
    value: 'passing',
    color: 'brightgreen',
  })

t.create('full build status with failed build')
  .get(
    '/https/selfhosted.teamcity.com:4000/tc/e/bt567.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com:4000/tc/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt567)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'FAILURE',
        statusText: 'Tests failed: 10 (2 new), passed: 99',
      })
  )
  .expectJSON({
    name: 'build',
    value: 'tests failed: 10 (2 new), passed: 99',
    color: 'red',
  })

t.create('with auth')
  .before(mockTeamCityCreds)
  .get('/https/selfhosted.teamcity.com/e/bt678.json?style=_shields_test')
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt678)')}`)
      .query({})
      // This ensures that the expected credentials from serverSecrets are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({
        user,
        pass,
      })
      .reply(200, {
        status: 'FAILURE',
        statusText:
          'Tests failed: 1 (1 new), passed: 50246, ignored: 1, muted: 12',
      })
  )
  .finally(restore)
  .expectJSON({
    name: 'build',
    value: 'tests failed: 1 (1 new), passed: 50246, ignored: 1, muted: 12',
    color: 'red',
  })
