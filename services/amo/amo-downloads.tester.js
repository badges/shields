import { ServiceTester } from '../tester.js'
import { isMetricOverTimePeriod } from '../test-validators.js'
export const t = new ServiceTester({
  id: 'AmoDownloads',
  title: 'AmoDownloads',
  pathPrefix: '/amo',
})

t.create('Weekly Downloads')
  .get('/dw/duckduckgo-for-firefox.json')
  .expectBadge({ label: 'downloads', message: isMetricOverTimePeriod })

t.create('Weekly Downloads (not found)')
  .get('/dw/not-a-real-plugin.json')
  .expectBadge({ label: 'downloads', message: 'not found' })

t.create('/d URL should redirect to /dw')
  .get('/d/dustman.svg')
  .expectRedirect('/amo/dw/dustman.svg')
