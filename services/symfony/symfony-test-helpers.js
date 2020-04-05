'use strict'

const sampleProjectUuid = '45afb680-d4e6-4e66-93ea-bcfa79eb8a87'

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
const noGradeMockResponse = createMockResponse({})
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

const user = 'admin'
const token = 'password'
const config = {
  public: { services: {} },
  private: {
    sl_insight_userUuid: user,
    sl_insight_apiToken: token,
  },
}

const { noToken } = require('../test-helpers')
const { SymfonyInsightBase } = require('./symfony-insight-base')
const noSymfonyToken = noToken(SymfonyInsightBase)

module.exports = {
  sampleProjectUuid,
  runningMockResponse,
  platinumMockResponse,
  goldMockResponse,
  silverMockResponse,
  bronzeMockResponse,
  noMedalMockResponse,
  noGradeMockResponse,
  criticalViolation,
  majorViolation,
  minorViolation,
  infoViolation,
  multipleViolations,
  user,
  token,
  config,
  noSymfonyToken,
}
