import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('Issues')
  .get('/issues/MAX30/TopAndDownButtonsEverywhere.json')
  .expectBadge({ label: 'issues', message: isMetric })

t.create('Issues (not found)')
  .get('/issues/DenverCoder1/NotAScript2.json')
  .expectBadge({ label: 'issues', message: 'user or project not found' })
