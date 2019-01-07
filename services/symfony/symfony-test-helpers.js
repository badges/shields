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
const originalUuid = serverSecrets.sl_insight_userUuid
const originalApiToken = serverSecrets.sl_insight_apiToken

function setSymfonyInsightCredsToFalsy() {
  serverSecrets['sl_insight_userUuid'] = undefined
  serverSecrets['sl_insight_apiToken'] = undefined
}

function mockSymfonyInsightCreds() {
  // ensure that the fields exists  before attempting to stub
  setSymfonyInsightCredsToFalsy()
  sinon.stub(serverSecrets, 'sl_insight_userUuid').value(mockSymfonyUser)
  sinon.stub(serverSecrets, 'sl_insight_apiToken').value(mockSymfonyToken)
}

function restore() {
  sinon.restore()
  serverSecrets['sl_insight_userUuid'] = originalUuid
  serverSecrets['sl_insight_apiToken'] = originalApiToken
}

function prepLiveTest() {
  // Since the service implementation will throw an error if the creds
  // are missing, we need to ensure that creds are available for each test.
  // In the case of the live tests we want to use the "real" creds if they
  // exist otherwise we need to use the same stubbed creds as all the mocked tests.
  if (!originalUuid) {
    console.warn(
      'No token provided, this test will mock Symfony Insight API responses.'
    )
    mockSymfonyInsightCreds()
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
  setSymfonyInsightCredsToFalsy,
  restore,
  realTokenExists: originalUuid,
  prepLiveTest,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
}
