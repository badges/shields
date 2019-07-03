'use strict'

const {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

// The below page includes links to various publicly accessible Jenkins instances
// although many of the links are dead, it is is still a helpful resource for finding
// target Jenkins instances/jobs to use for testing.
// https://wiki.jenkins.io/pages/viewpage.action?pageId=58001258

t.create('Test status')
  .get('/https/jenkins.sqlalchemy.org/alembic_coverage.json')
  .expectBadge({ label: 'tests', message: isDefaultTestTotals })

t.create('Test status with compact message')
  .get('/https/jenkins.sqlalchemy.org/alembic_coverage.json', {
    qs: { compact_message: null },
  })
  .expectBadge({ label: 'tests', message: isDefaultCompactTestTotals })

t.create('Test status with custom labels')
  .get('/https/jenkins.sqlalchemy.org/alembic_coverage.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Test status with compact message and custom labels')
  .get('/https/jenkins.sqlalchemy.org/alembic_coverage.json', {
    qs: {
      compact_message: null,
      passed_label: '💃',
      failed_label: '🤦‍♀️',
      skipped_label: '🤷',
    },
  })
  .expectBadge({
    label: 'tests',
    message: isCustomCompactTestTotals,
  })

t.create('Test status on job with no tests')
  .get('/https/ci.eclipse.org/openj9/job/Build-Doc-Push_to_ghpages.json')
  .expectBadge({ label: 'tests', message: 'no tests found' })

t.create('Test status on non-existent job')
  .get('/https/ci.eclipse.org/openj9/job/does-not-exist.json')
  .expectBadge({ label: 'tests', message: 'instance or job not found' })
