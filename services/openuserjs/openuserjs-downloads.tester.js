import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Installs')
  .get('/dt/author/YouTube_Comment_Blacklist.json')
  .expectBadge({ label: 'installs', message: isMetric })

t.create('Installs (not found)')
  .get('/dt/author/NotAScript1.json')
  .expectBadge({ label: 'installs', message: 'user or project not found' })
