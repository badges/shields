'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

// The below page includes links to various publicly accessible Jenkins instances
// although many of the links are dead, it is is still a helpful resource for finding
// target Jenkins instances/jobs to use for testing.
// https://wiki.jenkins.io/pages/viewpage.action?pageId=58001258

t.create('jacoco: job found')
  .get(
    `/jacoco.json?jobUrl=${encodeURIComponent(
      'https://wso2.org/jenkins/view/All%20Builds/job/archetypes'
    )}`
  )
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('jacoco: job not found')
  .get('/jacoco.json?jobUrl=https://wso2.org/jenkins/job/does-not-exist')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('cobertura: job not found')
  .get(
    '/cobertura.json?jobUrl=https://jenkins.sqlalchemy.org/job/does-not-exist'
  )
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('cobertura: job found')
  .get(
    '/cobertura.json?jobUrl=https://jenkins.sqlalchemy.org/job/alembic_coverage'
  )
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('code coverage API: job not found')
  .get(
    '/api.json?jobUrl=https://jenkins.library.illinois.edu/job/does-not-exist'
  )
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('code coverage API: job found')
  .get(
    '/api.json?jobUrl=https://jenkins.library.illinois.edu/job/OpenSourceProjects/job/Speedwagon/job/master'
  )
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })
