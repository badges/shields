'use strict'

const Joi = require('joi')
const { colorScheme } = require('../test-helpers')
const t = (module.exports = require('../create-service-tester')())
const { withRegex } = require('../test-validators')

const {
  runningMockResponse,
  platinumMockResponse,
  goldMockResponse,
  silverMockResponse,
  bronzeMockResponse,
  noMedalMockResponse,
  mockSymfonyUser,
  mockSymfonyToken,
  mockSymfonyInsightCreds,
  restore,
  realTokenExists,
  prepLiveTest,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
} = require('./symfony-test-helpers')

const sampleProjectUuid = '45afb680-d4e6-4e66-93ea-bcfa79eb8a87'

beforeEach(function() {
  mockSymfonyInsightCreds()
})

afterEach(function() {
  restore()
})

t.create('live: valid project grade')
  .before(prepLiveTest)
  .get(`/symfony/i/grade/${sampleProjectUuid}.json`)
  .timeout(15000)
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'grade',
      value: Joi.equal(
        'platinum',
        'gold',
        'silver',
        'bronze',
        'no medal'
      ).required(),
    })
  )

t.create('live: valid project violations')
  .before(prepLiveTest)
  .get(`/symfony/i/violations/${sampleProjectUuid}.json`)
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

t.create('live: nonexistent project')
  .before(prepLiveTest)
  .get('/symfony/i/grade/45afb680-d4e6-4e66-93ea-bcfa79eb8a88.json')
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88')
      .reply(404)
  )
  .expectJSON({
    name: 'symfony insight',
    value: 'project not found',
  })

t.create('404 project not found grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(404)
  )
  .expectJSON({
    name: 'symfony insight',
    value: 'project not found',
  })

t.create('401 not authorized grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(401)
  )
  .expectJSON({
    name: 'symfony insight',
    value: 'not authorized to access project',
  })

t.create('pending project grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'pending',
    colorB: colorScheme.lightgrey,
  })

t.create('platinum grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'platinum',
    colorB: '#E5E4E2',
  })

t.create('gold grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'gold',
    colorB: '#EBC760',
  })

t.create('silver grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, silverMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'silver',
    colorB: '#C0C0C0',
  })

t.create('bronze grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, bronzeMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'bronze',
    colorB: '#C88F6A',
  })

t.create('no medal grade')
  .get(`/symfony/i/grade/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, noMedalMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'no medal',
    colorB: colorScheme.red,
  })

t.create('zero violations')
  .get(`/symfony/i/violations/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectJSON({
    name: 'violations',
    value: '0',
    colorB: colorScheme.brightgreen,
  })

t.create('critical violations')
  .get(`/symfony/i/violations/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, criticalViolation)
  )
  .expectJSON({
    name: 'violations',
    value: '1 critical',
    colorB: colorScheme.red,
  })

t.create('major violations')
  .get(`/symfony/i/violations/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, majorViolation)
  )
  .expectJSON({
    name: 'violations',
    value: '1 major',
    colorB: colorScheme.orange,
  })

t.create('minor violations')
  .get(`/symfony/i/violations/${sampleProjectUuid}.json?style=_shields_test`)
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
    colorB: colorScheme.yellow,
  })

t.create('info violations')
  .get(`/symfony/i/violations/${sampleProjectUuid}.json?style=_shields_test`)
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
    colorB: colorScheme.yellowgreen,
  })

t.create('multiple violations grade')
  .get(`/symfony/i/violations/${sampleProjectUuid}.json?style=_shields_test`)
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
    colorB: colorScheme.red,
  })

t.create('auth missing')
  .before(restore)
  .get(`/symfony/i/grade/${sampleProjectUuid}.json`)
  .expectJSON({
    name: 'symfony insight',
    value: 'required API tokens not found in config',
  })

// These tests ensure that the legacy badge path (/sensiolabs/i/projectUuid) still works
t.create('legacy path: pending project grade')
  .get(`/sensiolabs/i/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'pending',
    colorB: colorScheme.lightgrey,
  })

t.create('legacy path: platinum grade')
  .get(`/sensiolabs/i/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'platinum',
    colorB: '#E5E4E2',
  })
