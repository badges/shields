'use strict'

const Joi = require('joi')

const { colorScheme } = require('../test-helpers')
const { isIntegerPercentage } = require('../test-validators')
const {
  mockTeamCityCreds,
  pass,
  user,
  restore,
} = require('./teamcity-test-helpers')
const t = (module.exports = require('../create-service-tester')())

t.create('live: valid buildId')
  .get('/bt428.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('live: specified instance valid buildId')
  .get('/https/teamcity.jetbrains.com/bt428.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverage',
      value: isIntegerPercentage,
    })
  )

t.create('live: invalid buildId')
  .get('/btABC999.json')
  .expectJSON({ name: 'coverage', value: 'build not found' })

t.create('live: specified instance invalid buildId')
  .get('/https/teamcity.jetbrains.com/btABC000.json')
  .expectJSON({ name: 'coverage', value: 'build not found' })

t.create('404 latest build error response')
  .get('/bt123.json')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt123)')}/statistics`)
      .query({ guest: 1 })
      .reply(404)
  )
  .expectJSON({ name: 'coverage', value: 'build not found' })

t.create('no coverage data for build')
  .get('/bt234.json')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt234)')}/statistics`)
      .query({ guest: 1 })
      .reply(200, { property: [] })
  )
  .expectJSON({ name: 'coverage', value: 'no coverage data available' })

t.create('zero lines covered')
  .get('/bt345.json?style=_shields_test')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt345)')}/statistics`)
      .query({ guest: 1 })
      .reply(200, {
        property: [
          {
            name: 'CodeCoverageAbsSCovered',
            value: '0',
          },
          {
            name: 'CodeCoverageAbsSTotal',
            value: '345',
          },
        ],
      })
  )
  .expectJSON({
    name: 'coverage',
    value: '0%',
    colorB: colorScheme.red,
  })

t.create('with auth, lines covered')
  .before(mockTeamCityCreds)
  .get('/https/selfhosted.teamcity.com/bt678.json?style=_shields_test')
  .intercept(nock =>
    nock('https://selfhosted.teamcity.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt678)')}/statistics`)
      .query({})
      // This ensures that the expected credentials from serverSecrets are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({
        user,
        pass,
      })
      .reply(200, {
        property: [
          {
            name: 'CodeCoverageAbsSCovered',
            value: '82',
          },
          {
            name: 'CodeCoverageAbsSTotal',
            value: '100',
          },
        ],
      })
  )
  .finally(restore)
  .expectJSON({
    name: 'coverage',
    value: '82%',
    colorB: colorScheme.yellowgreen,
  })
