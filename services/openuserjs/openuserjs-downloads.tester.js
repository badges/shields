import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Downloads')
  .get('/dt/NatoBoram/YouTube_Comment_Blacklist.json')
  .expectBadge({ label: 'downloads', message: isMetric })

t.create('Downloads (not found)')
  .get('/dt/DenverCoder1/NotAScript1.json')
  .expectBadge({ label: 'downloads', message: 'user or project not found' })
