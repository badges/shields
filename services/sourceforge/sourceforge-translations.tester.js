import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('translations')
  .get('/guitarix.json')
  .expectBadge({ label: 'translations', message: isMetric })

t.create('translations (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'translations', message: 'project not found' })
