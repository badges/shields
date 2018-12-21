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
  mockSLUser,
  mockSLApiToken,
  mockSensiolabsCreds,
  restore,
  tokenExists,
  logTokenWarning,
} = require('./sensiolabs-test-helpers')

const gradeRegex = /platinum|gold|silver|bronze|no medal/
const sampleProjectUuid = '45afb680-d4e6-4e66-93ea-bcfa79eb8a87'

t.create('live: valid project')
  .before(logTokenWarning)
  .get(`/${sampleProjectUuid}.json`)
  .timeout(10000)
  .interceptIf(!tokenExists, nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'check',
      value: withRegex(gradeRegex),
    })
  )

t.create('live: nonexistent project')
  .before(logTokenWarning)
  .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88.json')
  .interceptIf(!tokenExists, nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get('/45afb680-d4e6-4e66-93ea-bcfa79eb8a88')
      .reply(404)
  )
  .expectJSON({
    name: 'check',
    value: 'project not found',
  })

t.create('404 project not found')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(404)
  )
  .expectJSON({
    name: 'check',
    value: 'project not found',
  })

t.create('401 not authorized')
  .get(`/${sampleProjectUuid}.json`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(401)
  )
  .expectJSON({
    name: 'check',
    value: 'not authorized to access project',
  })

t.create('pending project')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, runningMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'pending',
    colorB: colorScheme.grey,
  })

t.create('platinum medal project')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, platinumMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'platinum',
    colorB: colorScheme.brightgreen,
  })

t.create('gold medal project')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, goldMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'gold',
    colorB: colorScheme.yellow,
  })

t.create('silver medal project')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, silverMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'silver',
    colorB: colorScheme.lightgrey,
  })

t.create('bronze medal project')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, bronzeMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'bronze',
    colorB: colorScheme.orange,
  })

t.create('no medal project')
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      .reply(200, noMedalMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'no medal',
    colorB: colorScheme.red,
  })

t.create('auth')
  .before(mockSensiolabsCreds)
  .get(`/${sampleProjectUuid}.json?style=_shields_test`)
  .intercept(nock =>
    nock('https://insight.sensiolabs.com/api/projects')
      .get(`/${sampleProjectUuid}`)
      // This ensures that the expected credentials from serverSecrets are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({
        user: mockSLUser,
        pass: mockSLApiToken,
      })
      .reply(200, bronzeMockResponse)
  )
  .expectJSON({
    name: 'check',
    value: 'bronze',
    colorB: colorScheme.orange,
  })
  .finally(restore)
