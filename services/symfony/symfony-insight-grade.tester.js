'use strict'

const Joi = require('joi')
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

createTest(t, 'live: nonexistent project', { withMockCreds: false })
  .before(prepLiveTest)
  .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88.json')
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88')
      .reply(404)
  )
  .expectJSON({
    name: 'symfony insight',
    value: 'project not found',
  })

createTest(t, '401 not authorized grade')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(401)
  )
  .expectJSON({
    name: 'symfony insight',
    value: 'not authorized to access project',
  })

createTest(t, 'pending project grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'pending',
    color: 'lightgrey',
  })

createTest(t, 'platinum grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'platinum',
    color: '#e5e4e2',
  })

createTest(t, 'gold grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'gold',
    color: '#ebc760',
  })

createTest(t, 'silver grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, silverMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'silver',
    color: '#c0c0c0',
  })

createTest(t, 'bronze grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, bronzeMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'bronze',
    color: '#c88f6a',
  })

createTest(t, 'no medal grade')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, noMedalMockResponse)
  )
  .expectJSON({
    name: 'grade',
    value: 'no medal',
    color: 'red',
  })

createTest(t, 'auth missing', { withMockCreds: false })
  .before(setSymfonyInsightCredsToFalsy)
  .get(`/${sampleProjectUuid}.json`)
  .expectJSON({
    name: 'symfony insight',
    value: 'required API tokens not found in config',
  })
  .after(restore)
