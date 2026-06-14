import { ServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'
export const t = new ServiceTester({
  id: 'ThunderbirdDownloads',
  title: 'ThunderbirdDownloads',
  pathPrefix: '/thunderbird',
})

t.create('Weekly Downloads')
  .get('/dw/dustman.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('Weekly Downloads (not found)')
  .get('/dw/not-a-real-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

