import { createServiceTester } from '../tester.js'
import { isMetric, isMetricOverTimePeriod } from '../test-validators.js'

export const t = await createServiceTester()

t.create('weekly downloads (valid)')
  .get('/dw/hashicorp/consul/aws.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('monthly downloads (valid)')
  .get('/dm/hashicorp/consul/aws.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('yearly downloads (valid)')
  .get('/dy/hashicorp/consul/aws.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('total downloads (valid)')
  .get('/dt/hashicorp/consul/aws.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('weekly downloads (not found)')
  .get('/dw/not/real/module.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('monthly downloads (not found)')
  .get('/dm/not/real/module.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('yearly downloads (not found)')
  .get('/dy/not/real/module.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('total downloads (not found)')
  .get('/dt/not/real/module.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
