import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Contributors')
  .get('/guoxudong.io/shields-test/licenced-test.json')
  .expectBadge({
    label: 'contributors',
    message: isMetric,
  })

t.create('1 contributor')
  .get('/guoxudong.io/shields-test/licenced-test.json')
  .expectBadge({
    label: 'contributors',
    message: '1',
  })

t.create('Contributors (repo not found)')
  .get('/guoxudong.io/shields-test/do-not-exist.json')
  .expectBadge({
    label: 'contributors',
    message: 'project not found',
  })
