'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

function createMockResponse({ status = 'finished', grade, violations }) {
  let response = `
    <project>
      <last-analysis>
        <status><![CDATA[${status}]]></status>
        ${grade ? `<grade><![CDATA[${grade}]]></grade>` : ''}`
  if (violations) {
    response = `${response}<violations>`
    violations.forEach(v => {
      response = `${response}<violation severity="${v.severity}"></violation>`
    })
    response = `${response}</violations>`
  }
  return `${response}</last-analysis></project>`
}

const runningMockResponse = createMockResponse({
  status: 'running',
})
const platinumMockResponse = createMockResponse({
  grade: 'platinum',
})
const goldMockResponse = createMockResponse({
  grade: 'gold',
})
const silverMockResponse = createMockResponse({
  grade: 'silver',
})
const bronzeMockResponse = createMockResponse({
  grade: 'bronze',
})
const noMedalMockResponse = createMockResponse({
  grade: 'none',
})
const criticalViolation = createMockResponse({
  violations: [
    {
      severity: 'critical',
    },
  ],
})
const majorViolation = createMockResponse({
  violations: [
    {
      severity: 'major',
    },
  ],
})
const minorViolation = createMockResponse({
  violations: [
    {
      severity: 'minor',
    },
  ],
})
const infoViolation = createMockResponse({
  violations: [
    {
      severity: 'info',
    },
  ],
})
const multipleViolations = createMockResponse({
  violations: [
    {
      severity: 'info',
    },
    {
      severity: 'critical',
    },
  ],
})

const mockSymfonyUser = 'admin'
const mockSymfonyToken = 'password'

function mockSymfonyInsightCreds() {
  serverSecrets['sl_insight_userUuid'] = undefined
  serverSecrets['sl_insight_apiToken'] = undefined
  sinon.stub(serverSecrets, 'sl_insight_userUuid').value(mockSymfonyUser)
  sinon.stub(serverSecrets, 'sl_insight_apiToken').value(mockSymfonyToken)
}

const originalUuid = serverSecrets.sl_insight_userUuid
const originalApiToken = serverSecrets.sl_insight_apiToken

function prepLiveTest() {
  // Since the service implementation will throw an error if the creds
  // are missing, there is a beforeEach hook that ensures there's mock creds
  // used for each test. This will use the "real" creds if the exist, otherwise
  // it will use the same stubbed creds as all the mocked tests.
  if (!originalUuid) {
    console.warn(
      'No token provided, this test will mock Symfony Insight API responses.'
    )
  } else {
    serverSecrets.sl_insight_userUuid = originalUuid
    serverSecrets.sl_insight_apiToken = originalApiToken
  }
}

module.exports = {
  runningMockResponse,
  platinumMockResponse,
  goldMockResponse,
  silverMockResponse,
  bronzeMockResponse,
  noMedalMockResponse,
  mockSymfonyUser,
  mockSymfonyToken,
  mockSymfonyInsightCreds,
  restore: sinon.restore,
  realTokenExists: originalUuid,
  prepLiveTest,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
}
