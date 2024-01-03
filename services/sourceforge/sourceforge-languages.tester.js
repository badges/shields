import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('languages')
  .get('/guitarix.json')
  .expectBadge({ label: 'languages', message: isMetric })

t.create('languages (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'languages', message: 'project not found' })
