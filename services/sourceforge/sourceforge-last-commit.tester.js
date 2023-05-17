import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last commit')
  .get('/guitarix.json')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (project not found)')
  .get('/that-doesnt-exist.json')
  .expectBadge({ label: 'last commit', message: 'project not found' })
