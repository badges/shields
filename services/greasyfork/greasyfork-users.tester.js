import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Users')
  .get('/407466.json')
  .expectBadge({ label: 'users', message: isMetric })

t.create('Users (not found)')
  .get('/000000.json')
  .expectBadge({ label: 'users', message: 'not found' })
