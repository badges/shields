import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Users')
  .get('/IndieGala-Helper.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/not-a-real-plugin.json')
  .expectBadge({ label: 'users', message: 'not found' })
