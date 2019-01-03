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
  setSymfonyInsightCredsToFalsy,
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

function create(title, { withMockCreds = true } = { withMockCreds: true }) {
  const result = t.create(title)
  if (withMockCreds) {
    result.before(mockSymfonyInsightCreds)
    result.finally(restore)
  }
  return result
}

create('live: valid project grade', { withMockCreds: false })
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

create('live: valid project violations', { withMockCreds: false })
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

create('live: nonexistent project', { withMockCreds: false })
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

create('404 project not found grade')
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

create('401 not authorized grade')
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

create('pending project grade')
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

create('platinum grade')
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

create('gold grade')
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

create('silver grade')
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

create('bronze grade')
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

create('no medal grade')
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

create('zero violations')
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

create('critical violations')
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

create('major violations')
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

create('minor violations')
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

create('info violations')
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

create('multiple violations grade')
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

create('auth missing', { withMockCreds: false })
  .before(setSymfonyInsightCredsToFalsy)
  .get(`/symfony/i/grade/${sampleProjectUuid}.json`)
  .expectJSON({
    name: 'symfony insight',
    value: 'required API tokens not found in config',
  })

// These tests ensure that the legacy badge path (/sensiolabs/i/projectUuid) still works
create('legacy path: pending project grade')
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

create('legacy path: platinum grade')
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
