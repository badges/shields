'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const org = 'azuredevops-powershell'
const project = 'azuredevops-powershell'
const definitionId = 1
const nonExistentDefinitionId = 9999
const buildId = 20
const uriPrefix = `/${org}/${project}`
const azureDevOpsApiBaseUri = `https://dev.azure.com/${org}/${project}/_apis`
const mockBadgeUriPath = `${uriPrefix}/${definitionId}`
const mockBadgeUri = `${mockBadgeUriPath}.json`
const mockBranchBadgeUri = `${mockBadgeUriPath}/master.json`
const mockLatestBuildApiUriPath = `/build/builds?definitions=${definitionId}&%24top=1&statusFilter=completed&api-version=5.0-preview.4`
const mockLatestBranchBuildApiUriPath = `/build/builds?definitions=${definitionId}&%24top=1&statusFilter=completed&api-version=5.0-preview.4&branchName=refs%2Fheads%2Fmaster`
const mockNonExistentBuildApiUriPath = `/build/builds?definitions=${nonExistentDefinitionId}&%24top=1&statusFilter=completed&api-version=5.0-preview.4`
const mockTestResultSummaryApiUriPath = `/test/ResultSummaryByBuild?buildId=${buildId}`
const latestBuildResponse = {
  count: 1,
  value: [{ id: buildId }],
}
const mockEmptyTestResultSummaryResponse = {
  aggregatedResultsAnalysis: {
    totalTests: 0,
    resultsByOutcome: {},
  },
}
const mockTestResultSummaryResponse = {
  aggregatedResultsAnalysis: {
    totalTests: 3,
    resultsByOutcome: {
      Passed: {
        count: 1,
      },
      Failed: {
        count: 1,
      },
      Skipped: {
        count: 1,
      },
    },
  },
}
const mockTestResultSummarySetup = nock =>
  nock(azureDevOpsApiBaseUri)
    .get(mockLatestBuildApiUriPath)
    .reply(200, latestBuildResponse)
    .get(mockTestResultSummaryApiUriPath)
    .reply(200, mockTestResultSummaryResponse)
const mockBranchTestResultSummarySetup = nock =>
  nock(azureDevOpsApiBaseUri)
    .get(mockLatestBranchBuildApiUriPath)
    .reply(200, latestBuildResponse)
    .get(mockTestResultSummaryApiUriPath)
    .reply(200, mockTestResultSummaryResponse)

const expectedDefaultAzureDevOpsTestTotals = '1 passed, 1 failed, 1 skipped'
const expectedCompactAzureDevOpsTestTotals = '✔ 1 | ✘ 1 | ➟ 1'
const expectedCustomAzureDevOpsTestTotals = '1 good, 1 bad, 1 n/a'
const expectedCompactCustomAzureDevOpsTestTotals = '💃 1 | 🤦‍♀️ 1 | 🤷 1'

function getLabelRegex(label, isCompact) {
  return isCompact ? `(?:${label} [0-9]*)` : `(?:[0-9]* ${label})`
}

function isAzureDevOpsTestTotals(
  passedLabel,
  failedLabel,
  skippedLabel,
  isCompact
) {
  const passedRegex = getLabelRegex(passedLabel, isCompact)
  const failedRegex = getLabelRegex(failedLabel, isCompact)
  const skippedRegex = getLabelRegex(skippedLabel, isCompact)
  const separator = isCompact ? ' | ' : ', '
  const regexStrings = [
    `^${passedRegex}$`,
    `^${failedRegex}$`,
    `^${skippedRegex}$`,
    `^${passedRegex}${separator}${failedRegex}$`,
    `^${failedRegex}${separator}${skippedRegex}$`,
    `^${passedRegex}${separator}${skippedRegex}$`,
    `^${passedRegex}${separator}${failedRegex}${separator}${skippedRegex}$`,
    `^no tests$`,
  ]

  return Joi.alternatives().try(
    regexStrings.map(regexStr => Joi.string().regex(new RegExp(regexStr)))
  )
}

const isDefaultAzureDevOpsTestTotals = isAzureDevOpsTestTotals(
  'passed',
  'failed',
  'skipped'
)
const isCompactAzureDevOpsTestTotals = isAzureDevOpsTestTotals(
  '✔',
  '✘',
  '➟',
  true
)
const isCustomAzureDevOpsTestTotals = isAzureDevOpsTestTotals(
  'good',
  'bad',
  'n\\/a'
)
const isCompactCustomAzureDevOpsTestTotals = isAzureDevOpsTestTotals(
  '💃',
  '🤦‍♀️',
  '🤷',
  true
)

t.create('unknown build definition')
  .get(`${uriPrefix}/${nonExistentDefinitionId}.json`)
  .expectJSON({ name: 'tests', value: 'build pipeline not found' })

t.create('404 latest build error response')
  .get(mockBadgeUri)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(404)
  )
  .expectJSON({
    name: 'tests',
    value: 'build pipeline or test result summary not found',
  })

t.create('no build response')
  .get(`${uriPrefix}/${nonExistentDefinitionId}.json`)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockNonExistentBuildApiUriPath)
      .reply(200, {
        count: 0,
        value: [],
      })
  )
  .expectJSON({ name: 'tests', value: 'build pipeline not found' })

t.create('no test result summary response')
  .get(mockBadgeUri)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockTestResultSummaryApiUriPath)
      .reply(404)
  )
  .expectJSON({
    name: 'tests',
    value: 'build pipeline or test result summary not found',
  })

t.create('invalid test result summary response')
  .get(mockBadgeUri)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockTestResultSummaryApiUriPath)
      .reply(200, {})
  )
  .expectJSON({ name: 'tests', value: 'invalid response data' })

t.create('no tests in test result summary response')
  .get(mockBadgeUri)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockTestResultSummaryApiUriPath)
      .reply(200, mockEmptyTestResultSummaryResponse)
  )
  .expectJSON({ name: 'tests', value: 'no tests' })

t.create('test status')
  .get(mockBadgeUri)
  .intercept(mockTestResultSummarySetup)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: expectedDefaultAzureDevOpsTestTotals,
    })
  )

t.create('test status on branch')
  .get(mockBranchBadgeUri)
  .intercept(mockBranchTestResultSummarySetup)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: expectedDefaultAzureDevOpsTestTotals,
    })
  )

t.create('test status with compact message')
  .get(mockBadgeUri, {
    qs: {
      compact_message: null,
    },
  })
  .intercept(mockTestResultSummarySetup)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: expectedCompactAzureDevOpsTestTotals,
    })
  )

t.create('test status with custom labels')
  .get(mockBadgeUri, {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .intercept(mockTestResultSummarySetup)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: expectedCustomAzureDevOpsTestTotals,
    })
  )

t.create('test status with compact message and custom labels')
  .get(mockBadgeUri, {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .intercept(mockTestResultSummarySetup)
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: expectedCompactCustomAzureDevOpsTestTotals,
    })
  )

t.create('live test status')
  .get(mockBadgeUri)
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isDefaultAzureDevOpsTestTotals })
  )

t.create('live test status on branch')
  .get(mockBranchBadgeUri)
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isDefaultAzureDevOpsTestTotals })
  )

t.create('live test status with compact message')
  .get(mockBadgeUri, {
    qs: {
      compact_message: null,
    },
  })
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isCompactAzureDevOpsTestTotals })
  )

t.create('live test status with custom labels')
  .get(mockBadgeUri, {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isCustomAzureDevOpsTestTotals })
  )

t.create('live test status with compact message and custom labels')
  .get(mockBadgeUri, {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .expectJSONTypes(
    Joi.object().keys({
      name: 'tests',
      value: isCompactCustomAzureDevOpsTestTotals,
    })
  )
