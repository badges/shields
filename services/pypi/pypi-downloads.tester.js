import { createServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'
export const t = await createServiceTester()

t.create('daily downloads (valid)')
  .get('/dd/djangorestframework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('weekly downloads (valid)')
  .get('/dw/djangorestframework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('monthly downloads (valid)')
  .get('/dm/djangorestframework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('downloads (mixed-case package name)')
  .get('/dd/DjangoRestFramework.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('daily downloads (not found)')
  .get('/dd/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

t.create('weekly downloads (not found)')
  .get('/dw/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

t.create('monthly downloads (not found)')
  .get('/dm/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })
