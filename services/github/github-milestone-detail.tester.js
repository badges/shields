import {
  isMetric,
  isMetricOverMetric,
  isIntegerPercentage,
} from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Milestone Open Issues')
  .get('/issues-open/MacroPower/milestone-test/1.json')
  .expectBadge({
    label: 'openWithOneOpenIssue open issues',
    message: isMetric,
  })

t.create('Milestone Closed Issues')
  .get('/issues-closed/MacroPower/milestone-test/3.json')
  .expectBadge({
    label: 'closedWithOneClosedIssue closed issues',
    message: isMetric,
  })

t.create('Milestone Total Issues')
  .get('/issues-total/MacroPower/milestone-test/2.json')
  .expectBadge({
    label: 'openWithOneOpenOneClosedIssue issues',
    message: isMetric,
  })

t.create('Milestone Progress')
  .get('/progress/MacroPower/milestone-test/2.json')
  .expectBadge({
    label: 'openWithOneOpenOneClosedIssue',
    message: isMetricOverMetric,
  })

t.create('Milestone Progress (Percent)')
  .get('/progress-percent/MacroPower/milestone-test/2.json')
  .expectBadge({
    label: 'openWithOneOpenOneClosedIssue',
    message: isIntegerPercentage,
  })

t.create('Milestones (repo or milestone not found)')
  .get('/progress/badges/helmets/1.json')
  .expectBadge({
    label: 'milestones',
    message: 'repo or milestone not found',
  })
