import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('commit count')
  .get('/guitarix/git.json')
  .expectBadge({ label: 'commit count', message: isMetric })

t.create('commit count (non default repo)')
  .get('/opencamera/code.json')
  .expectBadge({ label: 'commit count', message: isMetric })

t.create('commit count (project not found)')
  .get('/that-doesnt-exist/git.json')
  .expectBadge({ label: 'commit count', message: 'project or repo not found' })

t.create('commit count (repo not found)')
  .get('/guitarix/invalid-repo.json')
  .expectBadge({ label: 'commit count', message: 'project or repo not found' })
