import {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('unknown build definition')
  .get(`/swellaby/opensource/99999999.json`)
  .expectBadge({ label: 'tests', message: 'build pipeline not found' })

t.create('404 latest build error response')
  .get('/swellaby/fake/14.json')
  .intercept(nock =>
    nock('https://dev.azure.com/swellaby/fake/_apis')
      .get('/build/builds')
      .query({
        definitions: 14,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      })
      .reply(404)
  )
  .expectBadge({
    label: 'tests',
    message: 'build pipeline or test result summary not found',
  })

t.create('no test result summary response')
  .get('/swellaby/fake/14.json')
  .intercept(nock =>
    nock('https://dev.azure.com/swellaby/fake/_apis')
      .get('/build/builds')
      .query({
        definitions: 14,
        $top: 1,
        statusFilter: 'completed',
        'api-version': '5.0-preview.4',
      })
      .reply(200, { count: 1, value: [{ id: 1234 }] })
      .get('/test/ResultSummaryByBuild')
      .query({ buildId: 1234 })
      .reply(404)
  )
  .expectBadge({
    label: 'tests',
    message: 'build pipeline or test result summary not found',
  })

t.create('no build response')
  .get(`/swellaby/opensource/174.json`)
  .expectBadge({ label: 'tests', message: 'build pipeline not found' })

t.create('no tests in test result summary response')
  .get('/swellaby/opensource/14.json')
  .expectBadge({ label: 'tests', message: 'no tests' })

t.create('test status').get('/swellaby/opensource/25.json').expectBadge({
  label: 'tests',
  message: isDefaultTestTotals,
})

t.create('test status on branch')
  .get('/swellaby/opensource/25/master.json')
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('test status with compact message')
  .get('/swellaby/opensource/25.json', {
    qs: {
      compact_message: null,
    },
  })
  .expectBadge({
    label: 'tests',
    message: isDefaultCompactTestTotals,
  })

t.create('test status with custom labels')
  .get('/swellaby/opensource/25.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({
    label: 'tests',
    message: isCustomTestTotals,
  })

t.create('test status with compact message and custom labels')
  .get('/swellaby/opensource/25.json', {
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
