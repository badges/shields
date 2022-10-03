import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Total Contributions Valid')
  .get('/938767784.json')
  .expectBadge({ label: 'reports', message: isMetric })

t.create('Total Contributions Invalid')
  .get('/invalid_id.json')
  .expectBadge({ label: 'reports', message: 'profile not found' })
