import { isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'

export const t = await createServiceTester()

t.create('Weekly Downloads')
  .get('/cardbook.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('Weekly Downloads (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
