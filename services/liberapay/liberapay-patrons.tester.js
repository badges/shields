import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Patrons (valid)').get('/Liberapay.json').expectBadge({
  label: 'patrons',
  message: isMetric,
})

t.create('Patrons (not found)')
  .get('/does-not-exist.json')
  .expectBadge({ label: 'liberapay', message: 'not found' })
