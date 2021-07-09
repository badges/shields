import Joi from 'joi'
import { withRegex } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const buildStatusValues = Joi.equal('passing', 'failure', 'error').required()
const buildStatusTextRegex =
  /^success|failure|error|tests( failed: \d+( \(\d+ new\))?)?(,)?( passed: \d+)?(,)?( ignored: \d+)?(,)?( muted: \d+)?/

t.create('unknown build')
  .get('/s/btabc.json?server=https://teamcity.jetbrains.com')
  .expectBadge({ label: 'build', message: 'build not found' })

t.create('simple status for known build')
  .get('/s/bt345.json?server=https://teamcity.jetbrains.com')
  .expectBadge({
    label: 'build',
    message: buildStatusValues,
  })

t.create('full status for known build')
  .get('/e/bt345.json?server=https://teamcity.jetbrains.com')
  .expectBadge({
    label: 'build',
    message: withRegex(buildStatusTextRegex),
  })

t.create('codebetter success build')
  .get('/s/bt123.json?server=https://teamcity.jetbrains.com')
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
  .get('/s/bt123.json?server=https://teamcity.jetbrains.com')
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
  .get('/s/bt321.json?server=https://myteamcity.com:8080')
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
  .get('/s/bt999.json?server=https://myteamcity.com:8080')
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
  .get('/e/bt321.json?server=https://selfhosted.teamcity.com:4000')
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
  .get('/e/bt567.json?server=https://selfhosted.teamcity.com:4000/tc')
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

t.create('full build status with passed build chain')
  .get('/e/bt421.json?server=https://selfhosted.teamcity.com:4000')
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com:4000/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt421)')}`)
      .query({ guest: 1 })
      .reply(200, {
        status: 'SUCCESS',
        statusText: 'Build chain finished (success: 9)',
      })
  )
  .expectBadge({
    label: 'build',
    message: 'passing',
    color: 'brightgreen',
  })
