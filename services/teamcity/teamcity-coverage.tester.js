import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('invalid buildId')
  .get('/btABC999.json')
  .expectBadge({ label: 'coverage', message: 'build not found' })

t.create('valid buildId')
  .get('/FileHelpersStable.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('specified instance valid buildId')
  .get('/FileHelpersStable.json?server=https://teamcity.jetbrains.com')
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('Coverage (with metric)')
  .get(
    '/FileHelpersStable.json?server=https://teamcity.jetbrains.com&metric=line',
  )
  .expectBadge({
    label: 'coverage',
    message: isIntegerPercentage,
  })

t.create('no coverage data for build')
  .get('/bt234.json')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt234)')}/statistics`)
      .query({ guest: 1 })
      .reply(200, { property: [] }),
  )
  .expectBadge({ label: 'coverage', message: 'no coverage data available' })

t.create('mocked: coverage with line metric')
  .get('/MyFakeBuild.json?server=https://teamcity.jetbrains.com&metric=line')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:MyFakeBuild)')}/statistics`)
      .query({ guest: 1 })
      .reply(200, {
        property: [
          { name: 'CodeCoverageAbsLCovered', value: '85' },
          { name: 'CodeCoverageAbsLTotal', value: '100' },
        ],
      }),
  )
  .expectBadge({
    label: 'coverage',
    message: '85%',
  })

t.create('zero lines covered')
  .get('/bt345.json')
  .intercept(nock =>
    nock('https://teamcity.jetbrains.com/app/rest/builds')
      .get(`/${encodeURIComponent('buildType:(id:bt345)')}/statistics`)
      .query({ guest: 1 })
      .reply(200, {
        property: [
          {
            name: 'CodeCoverageAbsSCovered',
            value: '0',
          },
          {
            name: 'CodeCoverageAbsSTotal',
            value: '345',
          },
        ],
      }),
  )
  .expectBadge({
    label: 'coverage',
    message: '0%',
    color: 'red',
  })
