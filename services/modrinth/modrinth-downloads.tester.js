import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Downloads')
  .get('/AANobbMI.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/not-existing.json')
  .expectBadge({ label: 'downloads', message: 'not found', color: 'red' })
