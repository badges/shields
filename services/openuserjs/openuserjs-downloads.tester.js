import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'OpenUserJSDownloads',
  title: 'OpenUserJSDownloads',
  pathPrefix: '/openuserjs',
})

t.create('Daily Downloads')
  .get('/d/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Daily Downloads (not found)')
  .get('/d/NotAUser/NotAScript.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
