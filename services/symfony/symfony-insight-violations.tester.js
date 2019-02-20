'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')
const {
  createTest,
  goldMockResponse,
  runningMockResponse,
  prepLiveTest,
  sampleProjectUuid,
  realTokenExists,
  mockSymfonyUser,
  mockSymfonyToken,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
} = require('./symfony-test-helpers')

createTest(t, 'live: valid project violations', { withMockCreds: false })
  .before(prepLiveTest)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(15000)
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, multipleViolations)
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'violations',
      value: withRegex(
        /\d* critical|\d* critical, \d* major|\d* critical, \d* major, \d* minor|\d* critical, \d* major, \d* minor, \d* info|\d* critical, \d* minor|\d* critical, \d* info|\d* major|\d* major, \d* minor|\d* major, \d* minor, \d* info|\d* major, \d* info|\d* minor|\d* minor, \d* info/
      ),
    })
  )

createTest(t, 'pending project grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectJSON({
    name: 'violations',
    value: 'pending',
    color: 'lightgrey',
  })

createTest(t, 'zero violations')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectJSON({
    name: 'violations',
    value: '0',
    color: 'brightgreen',
  })

createTest(t, 'critical violations')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, criticalViolation)
  )
  .expectJSON({
    name: 'violations',
    value: '1 critical',
    color: 'red',
  })

createTest(t, 'major violations')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, majorViolation)
  )
  .expectJSON({
    name: 'violations',
    value: '1 major',
    color: 'orange',
  })

createTest(t, 'minor violations')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .basicAuth({
        user: mockSymfonyUser,
        pass: mockSymfonyToken,
      })
      .reply(200, minorViolation)
  )
  .expectJSON({
    name: 'violations',
    value: '1 minor',
    color: 'yellow',
  })

createTest(t, 'info violations')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .basicAuth({
        user: mockSymfonyUser,
        pass: mockSymfonyToken,
      })
      .reply(200, infoViolation)
  )
  .expectJSON({
    name: 'violations',
    value: '1 info',
    color: 'yellowgreen',
  })

createTest(t, 'multiple violations grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .basicAuth({
        user: mockSymfonyUser,
        pass: mockSymfonyToken,
      })
      .reply(200, multipleViolations)
  )
  .expectJSON({
    name: 'violations',
    value: '1 critical, 1 info',
    color: 'red',
  })
