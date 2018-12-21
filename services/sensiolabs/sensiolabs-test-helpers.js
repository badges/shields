'use strict'

const sinon = require('sinon')
const serverSecrets = require('../../lib/server-secrets')

function createMockResponse({ status, grade }) {
  return `
    <project>
      <last-analysis>
        <status><![CDATA[${status}]]></status>
        <violations></violations>
        ${grade ? `<grade><![CDATA[${grade}]]></grade>` : ''}
      </last-analysis>
    </project>`
}

const runningMockResponse = createMockResponse({
  status: 'running',
})
const platinumMockResponse = createMockResponse({
  status: 'finished',
  grade: 'platinum',
})
const goldMockResponse = createMockResponse({
  status: 'finished',
  grade: 'gold',
})
const silverMockResponse = createMockResponse({
  status: 'finished',
  grade: 'silver',
})
const bronzeMockResponse = createMockResponse({
  status: 'finished',
  grade: 'bronze',
})
const noMedalMockResponse = createMockResponse({
  status: 'finished',
  grade: 'none',
})

const mockSLUser = 'admin'
const mockSLApiToken = 'password'

function mockSensiolabsCreds() {
  serverSecrets['sl_insight_userUuid'] = undefined
  serverSecrets['sl_insight_apiToken'] = undefined
  sinon.stub(serverSecrets, 'sl_insight_userUuid').value(mockSLUser)
  sinon.stub(serverSecrets, 'sl_insight_apiToken').value(mockSLApiToken)
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
  mockSLUser,
  mockSLApiToken,
  mockSensiolabsCreds,
  restore: sinon.restore,
  tokenExists,
  logTokenWarning,
}
