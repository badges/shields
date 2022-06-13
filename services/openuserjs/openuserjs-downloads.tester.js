import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'OpenUserJSDownloads',
  title: 'OpenUserJS Downloads',
  pathPrefix: '/openuserjs',
})

t.create('Downloads')
  .get('/d/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/d/NotAUser/NotAScript.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
