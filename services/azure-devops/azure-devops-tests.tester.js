'use strict'

const Joi = require('joi')
const t = require('../create-service-tester')()
module.exports = t

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
const mockLatestBuildApiUriPath = `/build/builds?definitions=${definitionId}&%24top=1&api-version=5.0-preview.4`
const mockNonExistendBuildApiUriPath = `/build/builds?definitions=${nonExistentDefinitionId}&%24top=1&api-version=5.0-preview.4`
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

const isAzureDevOpsTestTotals = Joi.string().regex(
  /^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/
)

const isCompactAzureDevOpsTestTotals = Joi.string().regex(
  /^(?:[0-9]* ?(?:✔|✘|➟) ?[0-9]*(?:, | \| )?)+$/
)

const isCustomAzureDevOpsTestTotals = Joi.string().regex(
  /^(?:[0-9]+ (?:good|bad|n\/a)(?:, )?)+$/
)

const isCompactCustomAzureDevOpsTestTotals = Joi.string().regex(
  /^(?:[0-9]* ?(?:💃|🤦‍♀️|🤷) ?[0-9]*(?:, | \| )?)+$/
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
      .get(mockNonExistendBuildApiUriPath)
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
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAzureDevOpsTestTotals })
  )

t.create('test status on branch')
  .get(mockBranchBadgeUri)
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isAzureDevOpsTestTotals })
  )

t.create('test status with compact message')
  .get(mockBadgeUri, {
    qs: {
      compact_message: null,
    },
  })
  .expectJSONTypes(
    Joi.object().keys({ name: 'tests', value: isCompactAzureDevOpsTestTotals })
  )

t.create('test status with custom labels')
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

t.create('test status with compact message and custom labels')
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
