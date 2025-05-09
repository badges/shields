import { isFormattedDate } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('last commit')
  .get('/guitarix/git.json')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (non default repo)')
  .get('/opencamera/code.json')
  .expectBadge({ label: 'last commit', message: isFormattedDate })

t.create('last commit (project not found)')
  .get('/that-doesnt-exist/fake.json')
  .expectBadge({ label: 'last commit', message: 'project or repo not found' })

t.create('last commit (repo not found)')
  .get('/guitarix/fake-repo.json')
  .expectBadge({ label: 'last commit', message: 'project or repo not found' })
