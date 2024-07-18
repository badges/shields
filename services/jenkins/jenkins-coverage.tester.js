import { isIntegerPercentage } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// The below page includes links to various publicly accessible Jenkins instances
// although many of the links are dead, it is is still a helpful resource for finding
// target Jenkins instances/jobs to use for testing.
// https://wiki.jenkins.io/pages/viewpage.action?pageId=58001258

t.create('jacoco: job found')
  .get(
    `/jacoco.json?jobUrl=${encodeURIComponent(
      'https://ci-maven.apache.org/job/Maven/job/maven-box/job/maven-surefire/job/master',
    )}`,
  )
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('jacoco: job not found')
  .get('/jacoco.json?jobUrl=https://ci-maven.apache.org/job/does-not-exist')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

const coverageCoberturaResponse = {
  _class: 'io.jenkins.plugins.coverage.targets.CoverageResult',
  results: {
    elements: [
      { name: 'Classes', ratio: 52.0 },
      { name: 'Lines', ratio: 40.66363 },
    ],
  },
}

t.create('cobertura: job found')
  .get(
    '/cobertura.json?jobUrl=https://jenkins.sqlalchemy.org/job/dogpile_coverage',
  )
  .intercept(nock =>
    nock(
      'https://jenkins.sqlalchemy.org/job/dogpile_coverage/lastCompletedBuild',
    )
      .get('/cobertura/api/json')
      .query(true)
      .reply(200, coverageCoberturaResponse),
  )
  .expectBadge({ label: 'coverage', message: '41%' })

t.create('cobertura: job not found')
  .get(
    '/cobertura.json?jobUrl=https://jenkins.sqlalchemy.org/job/does-not-exist',
  )
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

const coverageApiV1Response = {
  _class: 'io.jenkins.plugins.coverage.targets.CoverageResult',
  results: {
    elements: [
      { name: 'Report', ratio: 100.0 },
      { name: 'Group', ratio: 100.0 },
      { name: 'Package', ratio: 66.666664 },
      { name: 'File', ratio: 52.0 },
      { name: 'Class', ratio: 52.0 },
      { name: 'Line', ratio: 40.66363 },
      { name: 'Conditional', ratio: 29.91968 },
    ],
  },
}

t.create('code coverage API v1: job found')
  .get(
    '/apiv1.json?jobUrl=http://loneraver.duckdns.org:8082/job/github/job/VisVid/job/master',
  )
  .intercept(nock =>
    nock(
      'http://loneraver.duckdns.org:8082/job/github/job/VisVid/job/master/lastCompletedBuild',
    )
      .get('/coverage/result/api/json')
      .query(true)
      .reply(200, coverageApiV1Response),
  )
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('code coverage API v1: job not found')
  .get(
    '/apiv1.json?jobUrl=http://loneraver.duckdns.org:8082/job/does-not-exist',
  )
  .intercept(nock =>
    nock(
      'http://loneraver.duckdns.org:8082/job/does-not-exist/lastCompletedBuild',
    )
      .get('/coverage/result/api/json')
      .query(true)
      .reply(404),
  )
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('code coverage API v4+: job found')
  .get(
    '/apiv4.json?jobUrl=https://jenkins.mm12.xyz/jenkins/job/nmfu/job/master',
  )
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('code coverage API v4+: job not found')
  .get('/apiv4.json?jobUrl=https://jenkins.mm12.xyz/jenkins/job/does-not-exist')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })
