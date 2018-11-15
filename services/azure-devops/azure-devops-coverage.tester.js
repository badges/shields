'use strict'

const Joi = require('joi')
const { withRegex } = require('../test-validators')
const t = require('../create-service-tester')()
module.exports = t

const service = 'azure-devops'
const noun = 'coverage'
const org = 'swellaby'
const project = 'opensource'
const linuxDefinitionId = 21
const macDefinitionId = 26
const windowsDefinitionId = 24
const nonExistentDefinitionId = 234421
const buildId = 946
const uriPrefix = `/${service}/${noun}/${org}/${project}`
const azureDevOpsApiBaseUri = `https://dev.azure.com/${org}/${project}/_apis`
const mockBadgeUriPath = `${uriPrefix}/${macDefinitionId}.json`
const mockLatestBuildApiUriPath = `/build/builds?definitions=${macDefinitionId}&$top=1&api-version=5.0-preview.4`
const mockCodeCoverageApiUriPath = `/test/codecoverage?buildId=${buildId}&api-version=5.0-preview.1`
const percentageRegex = /^[1-9][0-9]?%|^100%|^0%$/
const latestBuildResponse = {
  count: 1,
  value: [{ id: buildId }],
}
const firstLinesCovStat = {
  label: 'Lines',
  total: 23,
  covered: 19,
}

const branchCovStat = {
  label: 'Branches',
  total: 11,
  covered: 7,
}

const secondLinesCovStat = {
  label: 'Lines',
  total: 41,
  covered: 35,
}

const firstLinesCoverage = `${(
  (firstLinesCovStat.covered / firstLinesCovStat.total) *
  100
).toFixed(0)}%`
const multiLinesTotal = firstLinesCovStat.total + secondLinesCovStat.total
const multiLinesCovered = firstLinesCovStat.covered + secondLinesCovStat.covered
const multiLinesCoverage = `${(
  (multiLinesCovered / multiLinesTotal) *
  100
).toFixed(0)}%`

t.create('default branch coverage')
  .get(`${uriPrefix}/${linuxDefinitionId}.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: noun,
      value: withRegex(percentageRegex),
    })
  )

t.create('named branch')
  .get(`${uriPrefix}/${windowsDefinitionId}/docs.json`)
  .expectJSONTypes(
    Joi.object().keys({
      name: noun,
      value: withRegex(percentageRegex),
    })
  )

t.create('unknown build definition')
  .get(`${uriPrefix}/${nonExistentDefinitionId}.json`)
  .expectJSON({ name: noun, value: 'build pipeline not found' })

t.create('404 latest build error response')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(404)
  )
  .expectJSON({ name: noun, value: 'build pipeline or coverage not found' })

t.create('no build response')
  .get(`${uriPrefix}/${nonExistentDefinitionId}.json`)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(
        `/build/builds?definitions=${nonExistentDefinitionId}&$top=1&api-version=5.0-preview.4`
      )
      .reply(200, {
        count: 0,
        value: [],
      })
  )
  .expectJSON({ name: noun, value: 'build pipeline not found' })

t.create('404 code coverage error response')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(404)
  )
  .expectJSON({ name: noun, value: 'build pipeline or coverage not found' })

t.create('invalid code coverage response')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {})
  )
  .expectJSON({ name: noun, value: 'invalid response data' })

t.create('no code coverage reports')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, { coverageData: [] })
  )
  .expectJSON({ name: noun, value: '0%' })

t.create('no code coverage reports')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, { coverageData: [] })
  )
  .expectJSON({ name: noun, value: '0%' })

t.create('no line coverage stats')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [branchCovStat],
          },
        ],
      })
  )
  .expectJSON({ name: noun, value: '0%' })

t.create('single line coverage stats')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [firstLinesCovStat],
          },
        ],
      })
  )
  .expectJSON({ name: noun, value: firstLinesCoverage })

t.create('mixed line and branch coverage stats')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [firstLinesCovStat, branchCovStat],
          },
        ],
      })
  )
  .expectJSON({ name: noun, value: firstLinesCoverage })

t.create('multiple line coverage stat reports')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [
              firstLinesCovStat,
              branchCovStat,
              secondLinesCovStat,
            ],
          },
        ],
      })
  )
  .expectJSON({ name: noun, value: multiLinesCoverage })
