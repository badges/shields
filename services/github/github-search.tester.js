import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('hit counter')
  .get('/badges/shields/async%20handle.json')
  .expectBadge({ label: 'async handle counter', message: isMetric })

t.create('hit counter for nonexistent repo')
  .get('/badges/puppets/async%20handle.json')
  .expectBadge({ label: 'counter', message: 'repo not found' })
