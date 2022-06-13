import { ServiceTester } from '../tester.js'
import { isMetric } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'OpenUserJSDownloads',
  title: 'OpenUserJSDownloads',
  pathPrefix: '/openuserjs',
})

t.create('Issues')
  .get('/issues/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({ label: 'issues', message: isMetric })

t.create('Issues (not found)')
  .get('/issues/NotAUser/NotAScript.json')
  .expectBadge({ label: 'issues', message: 'not found' })
