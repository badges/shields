import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const org = 'swellaby'
const project = 'opensource'
const linuxDefinitionId = 25
const macDefinitionId = 26
const windowsDefinitionId = 24
const nonExistentDefinitionId = 234421
const buildId = 946
const uriPrefix = `/${org}/${project}`
const azureDevOpsApiBaseUri = `https://dev.azure.com/${org}/${project}/_apis`
const mockBadgeUriPath = `${uriPrefix}/${macDefinitionId}.json`
const mockLatestBuildApiUriPath = `/build/builds?definitions=${macDefinitionId}&%24top=1&statusFilter=completed&api-version=5.0-preview.4`
const mockCodeCoverageApiUriPath = `/test/codecoverage?buildId=${buildId}&api-version=5.0-preview.1`
const latestBuildResponse = {
  count: 1,
  value: [{ id: buildId }],
}

const firstLineCovStat = {
  label: 'Line',
  total: 23,
  covered: 19,
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

const secondLineCovStat = {
  label: 'Lines',
  total: 47,
  covered: 35,
}

const secondLinesCovStat = {
  label: 'Lines',
  total: 47,
  covered: 35,
}

const expCoverageSingleReport = '83%'
const expCoverageMultipleReports = '77%'

t.create('default branch coverage')
  .get(`${uriPrefix}/${linuxDefinitionId}.json`)
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('named branch without ref')
  .get(`${uriPrefix}/${windowsDefinitionId}/init.json`)
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('unknown build definition')
  .get(`${uriPrefix}/${nonExistentDefinitionId}.json`)
  .expectBadge({ label: 'coverage', message: 'build pipeline not found' })

t.create('404 latest build error response')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri).get(mockLatestBuildApiUriPath).reply(404)
  )
  .expectBadge({
    label: 'coverage',
    message: 'build pipeline or coverage not found',
  })

t.create('no build response')
  .get(`${uriPrefix}/${nonExistentDefinitionId}.json`)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(
        `/build/builds?definitions=${nonExistentDefinitionId}&%24top=1&statusFilter=completed&api-version=5.0-preview.4`
      )
      .reply(200, {
        count: 0,
        value: [],
      })
  )
  .expectBadge({ label: 'coverage', message: 'build pipeline not found' })

t.create('404 code coverage error response')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(404)
  )
  .expectBadge({
    label: 'coverage',
    message: 'build pipeline or coverage not found',
  })

t.create('invalid code coverage response')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {})
  )
  .expectBadge({ label: 'coverage', message: 'invalid response data' })

t.create('no code coverage reports')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, { coverageData: [] })
  )
  .expectBadge({ label: 'coverage', message: '0%' })

t.create('no code coverage reports')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, { coverageData: [] })
  )
  .expectBadge({ label: 'coverage', message: '0%' })

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
  .expectBadge({ label: 'coverage', message: '0%' })

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
  .expectBadge({ label: 'coverage', message: expCoverageSingleReport })

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
  .expectBadge({ label: 'coverage', message: expCoverageSingleReport })

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

t.create('single JaCoCo style line coverage stats')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [firstLineCovStat],
          },
        ],
      })
  )
  .expectBadge({ label: 'coverage', message: expCoverageSingleReport })

t.create('mixed JaCoCo style line and branch coverage stats')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [firstLineCovStat, branchCovStat],
          },
        ],
      })
  )
  .expectBadge({ label: 'coverage', message: expCoverageSingleReport })

t.create('multiple JaCoCo style line coverage stat reports')
  .get(mockBadgeUriPath)
  .intercept(nock =>
    nock(azureDevOpsApiBaseUri)
      .get(mockLatestBuildApiUriPath)
      .reply(200, latestBuildResponse)
      .get(mockCodeCoverageApiUriPath)
      .reply(200, {
        coverageData: [
          {
            coverageStats: [firstLineCovStat, branchCovStat, secondLineCovStat],
          },
        ],
      })
  )
  .expectBadge({ label: 'coverage', message: expCoverageMultipleReports })
