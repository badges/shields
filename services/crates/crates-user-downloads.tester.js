import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('total user downloads')
  .get('/udt/3027.json')
  .expectBadge({ label: 'downloads', message: isMetric })

// we can not test for id not linked to user as it returns 0 downloads

t.create('total user downloads (invalid)')
  .get('/udt/999999999999999999999999.json')
  .expectBadge({ label: 'crates.io', message: 'invalid' })
