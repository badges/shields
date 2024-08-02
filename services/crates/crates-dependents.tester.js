import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('dependent count').timeout(10000).get('/tokio.json').expectBadge({
  label: 'dependents',
  message: isMetric,
})

t.create('dependent count (nonexistent package)')
  .timeout(10000)
  .get('/foobar-is-not-crate.json')
  .expectBadge({
    label: 'crates.io',
    message: 'not found',
  })
