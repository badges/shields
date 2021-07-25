import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('clojars downloads (valid)').get('/prismic.json').expectBadge({
  label: 'downloads',
  message: isMetric,
})

t.create('clojars downloads (not found)')
  .get('/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
