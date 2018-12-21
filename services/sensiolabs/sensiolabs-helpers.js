'use strict'

const statusRegex = /ordered|running|measured|analyzed|finished/

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

module.exports = {
  runningMockResponse,
  platinumMockResponse,
  goldMockResponse,
  silverMockResponse,
  bronzeMockResponse,
  noMedalMockResponse,
  statusRegex,
}
