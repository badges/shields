import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Total Points Valid')
  .get('/sethi.json')
  .expectBadge({ label: 'points', message: isMetric })

t.create('Total Points Private')
  .get('/set.json')
  .expectBadge({ label: 'points', message: 'private' })

t.create('Total Points Invalid')
  .get('/invalid@username.json')
  .expectBadge({ label: 'points', message: 'profile not found' })
