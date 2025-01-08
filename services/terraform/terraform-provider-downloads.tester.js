import { createServiceTester } from '../tester.js'
import { isMetric, isMetricOverTimePeriod } from '../test-validators.js'

export const t = await createServiceTester()

t.create('weekly downloads (valid)')
  .get('/dw/323.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('monthly downloads (valid)')
  .get('/dm/323.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('yearly downloads (valid)')
  .get('/dy/323.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('total downloads (valid)')
  .get('/dt/323.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('weekly downloads (not found)')
  .get('/dw/not-valid.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('monthly downloads (not found)')
  .get('/dm/not-valid.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('yearly downloads (not found)')
  .get('/dy/not-valid.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('total downloads (not found)')
  .get('/dt/not-valid.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
