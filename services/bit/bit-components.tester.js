import { createServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'
export const t = await createServiceTester()

t.create('collection (valid)').get('/ramda/ramda.json').expectBadge({
  label: 'components',
  message: isMetric,
})

t.create('collection (valid)')
  .get('/bit/no-collection-test.json')
  .expectBadge({ label: 'components', message: 'collection not found' })
