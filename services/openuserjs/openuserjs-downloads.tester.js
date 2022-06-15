import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Downloads')
  .get('/dt/author/YouTube_Comment_Blacklist.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/dt/author/NotAScript1.json')
  .expectBadge({ label: 'downloads', message: 'user or project not found' })
