import { isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Monthly Questions for StackOverflow javascript')
  .get('/stackoverflow/qm/javascript.json')
  .expectBadge({
    label: 'stackoverflow javascript questions',
    message: isMetricOverTimePeriod,
  })

t.create('Monthly Questions for Tex Spacing')
  .get('/tex/qm/spacing.json')
  .expectBadge({
    label: 'tex spacing questions',
    message: isMetricOverTimePeriod,
  })
