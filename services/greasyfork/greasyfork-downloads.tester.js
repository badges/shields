import { ServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'GreasyForkDownloads',
  title: 'GreasyForkDownloads',
  pathPrefix: '/greasyfork',
})

t.create('Daily Downloads')
  .get('/dd/407466.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('Daily Downloads (not found)')
  .get('/dd/000000.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
