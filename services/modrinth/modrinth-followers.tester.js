import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Followers')
  .get('/AANobbMI.json')
  .expectBadge({ label: 'followers', message: isMetric })

t.create('Followers (not found)')
  .get('/not-existing.json')
  .expectBadge({ label: 'followers', message: 'not found', color: 'red' })
