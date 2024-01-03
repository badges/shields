import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('contributors')
  .get('/guitarix.json')
  .expectBadge({ label: 'contributors', message: isMetric })

t.create('contributors (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'contributors', message: 'project not found' })
