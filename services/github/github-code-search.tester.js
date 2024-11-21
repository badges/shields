import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('hit counter')
  .get('/search/code.json?query=async%20handle')
  .expectBadge({ label: 'async handle counter', message: isMetric })
