import { createServiceTester } from '../tester.js'
import { isMetric, isMetricOverTimePeriod } from '../test-validators.js'
export const t = await createServiceTester()

t.create('Daily Installs')
  .get('/dd/407466.json')
  .expectBadge({ label: 'installs', message: isMetricOverTimePeriod })

t.create('Daily Installs (not found)')
  .get('/dd/000000.json')
  .expectBadge({ label: 'installs', message: 'not found' })

t.create('Total Installs')
  .get('/dt/407466.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Total Installs (not found)')
  .get('/dt/000000.json')
  .expectBadge({ label: 'installs', message: 'not found' })

t.create('Total Installs (sleazyfork)')
  .get('/dt/374903.json')
  .expectBadge({ label: 'installs', message: isMetric })
