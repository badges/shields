import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = await createServiceTester()

t.create('Downloads')
  .get('/ebkr/r2modman')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/not-a-namespace/not-a-package-name')
  .expectBadge({ label: 'downloads', message: 'not found', color: 'red' })
