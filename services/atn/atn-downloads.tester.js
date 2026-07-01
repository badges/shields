import { createServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Weekly Downloads')
  .get('/dictionary-german.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('Weekly Downloads (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
