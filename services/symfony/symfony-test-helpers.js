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

const tokenExists = serverSecrets.sl_insight_userUuid
function logTokenWarning() {
  if (!tokenExists) {
    console.warn(
      'No token provided, this test will mock Symfony Insight API responses.'
    )
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
  tokenExists,
  logTokenWarning,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
}
