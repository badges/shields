'use strict'

const { isIntegerPercentage } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

// The below page includes links to various publicly accessible Jenkins instances
// although many of the links are dead, it is is still a helpful resource for finding
// target Jenkins instances/jobs to use for testing.
// https://wiki.jenkins.io/pages/viewpage.action?pageId=58001258

t.create('jacoco: job found')
  .get('/jacoco/https/wso2.org/jenkins/view/All%20Builds/job/archetypes.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })

t.create('jacoco: job not found')
  .get('/jacoco/https/wso2.org/jenkins/job/does-not-exist.json')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('cobertura: job not found')
  .get('/cobertura/https/jenkins.sqlalchemy.org/job/does-not-exist.json')
  .expectBadge({ label: 'coverage', message: 'job or coverage not found' })

t.create('cobertura: job found')
  .get('/cobertura/https/jenkins.sqlalchemy.org/alembic_coverage.json')
  .expectBadge({ label: 'coverage', message: isIntegerPercentage })
