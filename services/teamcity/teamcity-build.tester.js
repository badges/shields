'use strict'

const Joi = require('@hapi/joi')
const { withRegex } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const buildStatusValues = Joi.equal('passing', 'failure', 'error').required()
const buildStatusTextRegex = /^success|failure|error|tests( failed: \d+( \(\d+ new\))?)?(,)?( passed: \d+)?(,)?( ignored: \d+)?(,)?( muted: \d+)?/

t.create('codebetter unknown build')
  .get('/codebetter/btabc.json')
  .expectBadge({ label: 'build', message: 'build not found' })

t.create('codebetter known build')
  .get('/codebetter/IntelliJIdeaCe_JavaDecompilerEngineTests.json')
  .expectBadge({
    label: 'build',
    message: buildStatusValues,
  })

t.create('simple status for known build')
  .get('/https/teamcity.jetbrains.com/s/bt345.json')
  .expectBadge({
    label: 'build',
    message: buildStatusValues,
  })

t.create('full status for known build')
  .get('/https/teamcity.jetbrains.com/e/bt345.json')
  .expectBadge({
    label: 'build',
    message: withRegex(buildStatusTextRegex),
  })

t.create('codebetter success build')
  .get('/codebetter/bt123.json')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt123)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Success',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('codebetter failure build')
  .get('/codebetter/bt123.json')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt123)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'FAILURE',
        statusText: 'Tests failed: 2',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'failure',
    color: 'red',
  })

t.create('simple build status with passed build')
  .get('/https/myteamcity.com:8080/s/bt321.json')
  .intercept(nock =>
    nock('https://myteamcity.com:8080/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt321)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Tests passed: 100',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('simple build status with failed build')
  .get('/https/myteamcity.com:8080/s/bt999.json')
  .intercept(nock =>
    nock('https://myteamcity.com:8080/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt999)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'FAILURE',
        statusText: 'Tests failed: 10 (2 new)',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'failure',
    color: 'red',
  })

t.create('full build status with passed build')
  .get('/https/selfhosted.teamcity.com:4000/e/bt321.json')
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com:4000/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt321)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Tests passed: 100, ignored: 3',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('full build status with failed build')
  .get('/https/selfhosted.teamcity.com:4000/tc/e/bt567.json')
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com:4000/tc/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt567)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'FAILURE',
        statusText: 'Tests failed: 10 (2 new), passed: 99',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'tests failed: 10 (2 new), passed: 99',
    color: 'red',
  })
