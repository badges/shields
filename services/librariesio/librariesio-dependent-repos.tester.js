import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('dependent repo count')
  .timeout(10000)
  .get('/npm/got.json')
  .expectBadge({
    label: 'dependent repos',
    message: isMetric,
  })

t.create('dependent repo count (scoped npm package)')
  .timeout(10000)
  .get('/npm/@babel/core.json')
  .expectBadge({
    label: 'dependent repos',
    message: isMetric,
  })

t.create('dependent repo count (not a package)')
  .timeout(10000)
  .get('/npm/foobar-is-not-package.json')
  .expectBadge({
    label: 'dependent repos',
    message: 'package not found',
  })
