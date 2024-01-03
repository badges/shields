import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('commit count')
  .get('/guitarix.json')
  .expectBadge({ label: 'commit count', message: isMetric })

t.create('commit count (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'commit count', message: 'project not found' })
