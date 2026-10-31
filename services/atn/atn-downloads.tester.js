import { isMetricOverTimePeriod } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Weekly Downloads')
  .get('/unicodify-text-transformer.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
  })

t.create('Weekly Downloads (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'thunderbird add-on', message: 'not found' })
