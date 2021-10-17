import {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

// The below page includes links to various publicly accessible Jenkins instances
// although many of the links are dead, it is is still a helpful resource for finding
// target Jenkins instances/jobs to use for testing.
// https://wiki.jenkins.io/pages/viewpage.action?pageId=58001258

t.create('Test status')
  .get('/tests.json?jobUrl=https://jenkins.sqlalchemy.org/job/alembic_gerrit')
  .expectBadge({ label: 'tests', message: isDefaultTestTotals })

t.create('Test status with compact message')
  .get('/tests.json?jobUrl=https://jenkins.sqlalchemy.org/job/alembic_gerrit', {
    qs: { compact_message: null },
  })
  .expectBadge({ label: 'tests', message: isDefaultCompactTestTotals })

t.create('Test status with custom labels')
  .get('/tests.json?jobUrl=https://jenkins.sqlalchemy.org/job/alembic_gerrit', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Test status with compact message and custom labels')
  .get('/tests.json?jobUrl=https://jenkins.sqlalchemy.org/job/alembic_gerrit', {
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
  .get('/tests.json?jobUrl=https://ci.eclipse.org/orbit/job/orbit-recipes')
  .expectBadge({ label: 'tests', message: 'no tests found' })

t.create('Test status on non-existent job')
  .get('/tests.json?jobUrl=https://ci.eclipse.org/orbit/job/does-not-exist')
  .expectBadge({ label: 'tests', message: 'instance or job not found' })
