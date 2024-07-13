import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('downloads (valid)')
  .get('/dt/django.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
