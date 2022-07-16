import { isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Monthly Questions for StackOverflow dayjs')
  .get('/stackoverflow/qm/dayjs.json')
  .expectBadge({
    label: 'stackoverflow dayjs questions',
    message: isMetricOverTimePeriod,
  })

t.create('Monthly Questions for Tex Spacing')
  .get('/tex/qm/spacing.json')
  .expectBadge({
    label: 'tex spacing questions',
    message: isMetricOverTimePeriod,
  })
