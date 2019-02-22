'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { withRegex } = require('../test-validators')
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
} = require('./symfony-test-helpers')

createTest(t, 'live: valid project stars', { withMockCreds: false })
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
      name: 'stars',
      value: withRegex(
        /^(?=.{4}$)(\u2605{0,4}[\u00BC\u00BD\u00BE]?\u2606{0,4})$/
      ),
    })
  )

createTest(t, 'live (stars): nonexistent project', { withMockCreds: false })
  .before(prepLiveTest)
  .get('/abc.json')
  .interceptIf(!realTokenExists, nock =>
    nock('https://insight.symfony.com/api/projects')
      .get('/abc')
      .reply(404)
  )
  .expectJSON({
    name: 'symfony insight',
    value: 'project not found',
  })

createTest(t, 'pending project stars')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectJSON({
    name: 'stars',
    value: 'pending',
    color: 'lightgrey',
  })

createTest(t, 'platinum stars')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSON({
    name: 'stars',
    value: '★★★★',
    color: '#e5e4e2',
  })

createTest(t, 'gold stars')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectJSON({
    name: 'stars',
    value: '★★★☆',
    color: '#ebc760',
  })

createTest(t, 'silver stars')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, silverMockResponse)
  )
  .expectJSON({
    name: 'stars',
    value: '★★☆☆',
    color: '#c0c0c0',
  })

createTest(t, 'bronze stars')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, bronzeMockResponse)
  )
  .expectJSON({
    name: 'stars',
    value: '★☆☆☆',
    color: '#c88f6a',
  })

createTest(t, 'no medal stars')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.symfony.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, noMedalMockResponse)
  )
  .expectJSON({
    name: 'stars',
    value: '☆☆☆☆',
    color: 'red',
  })
