import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Flathub Downloads (valid)')
  .get('/org.mozilla.firefox.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('Flathub Downloads  (not found)')
  .get('/not.a.package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
