import { createServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'

export const t = await createServiceTester()

t.create('daily downloads (valid)')
  .get('/dm/freetube.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('yearly downloads (valid)')
  .get('/dq/freetube.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('yearly downloads (valid)')
  .get('/dy/freetube.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('daily downloads (not found)')
  .get('/dm/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'cask not found' })

t.create('yearly downloads (not found)')
  .get('/dq/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'cask not found' })

t.create('yearly downloads (not found)')
  .get('/dy/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'cask not found' })
