import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Likes')
  .get('/ebkr/r2modman.json')
  .expectBadge({ label: 'likes', message: isMetric })

t.create('Likes (not found)')
  .get('/not-a-namespace/not-a-package-name.json')
  .expectBadge({ label: 'likes', message: 'not found', color: 'red' })
