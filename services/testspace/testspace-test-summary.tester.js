import { createServiceTester } from '../tester.js'
import {
  isDefaultTestTotals,
  isDefaultCompactTestTotals,
  isCustomTestTotals,
  isCustomCompactTestTotals,
} from '../test-validators.js'
export const t = await createServiceTester()

t.create('Tests')
  .get('/swellaby/swellaby:testspace-sample/main.json')
  .expectBadge({
    label: 'tests',
    message: isDefaultTestTotals,
  })

t.create('Tests with compact message')
  .get('/swellaby/swellaby:testspace-sample/main.json', {
    qs: {
      compact_message: null,
    },
  })
  .expectBadge({
    label: 'tests',
    message: isDefaultCompactTestTotals,
  })

t.create('Tests with custom labels')
  .get('/swellaby/swellaby:testspace-sample/main.json', {
    qs: {
      passed_label: 'good',
      failed_label: 'bad',
      skipped_label: 'n/a',
    },
  })
  .expectBadge({ label: 'tests', message: isCustomTestTotals })

t.create('Tests with compact message and custom labels')
  .get('/swellaby/swellaby:testspace-sample/main.json', {
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
