'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())
const {
  createTest,
  runningMockResponse,
  platinumMockResponse,
  goldMockResponse,
  silverMockResponse,
  bronzeMockResponse,
  noMedalMockResponse,
  prepLiveTest,
  sampleProjectUuid,
  realTokenExists,
  setSymfonyInsightCredsToFalsy,
  restore,
} = require('./symfony-test-helpers')

createTest(t, 'live: valid project grade', { withMockCreds: false })
  .before(prepLiveTest)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(15000)
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: Joi.equal(
      'platinum',
      'gold',
      'silver',
      'bronze',
      'no medal'
    ).required(),
  })

createTest(t, 'live: nonexistent project', { withMockCreds: false })
  .before(prepLiveTest)
  .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88.json')
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88')
      .reply(404)
  )
  .expectBadge({
    label: 'symfony insight',
    message: 'project not found',
  })

createTest(t, '401 not authorized grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(401)
  )
  .expectBadge({
    label: 'symfony insight',
    message: 'not authorized to access project',
  })

createTest(t, 'pending project grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: 'pending',
    color: 'lightgrey',
  })

createTest(t, 'platinum grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: 'platinum',
    color: '#e5e4e2',
  })

createTest(t, 'gold grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: 'gold',
    color: '#ebc760',
  })

createTest(t, 'silver grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, silverMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: 'silver',
    color: '#c0c0c0',
  })

createTest(t, 'bronze grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, bronzeMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: 'bronze',
    color: '#c88f6a',
  })

createTest(t, 'no medal grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, noMedalMockResponse)
  )
  .expectBadge({
    label: 'grade',
    message: 'no medal',
    color: 'red',
  })

createTest(t, 'auth missing', { withMockCreds: false })
  .before(setSymfonyInsightCredsToFalsy)
  .get(`/${sampleProjectUuid}.json`)
  .expectBadge({
    label: 'symfony insight',
    message: 'required API tokens not found in config',
  })
  .after(restore)
