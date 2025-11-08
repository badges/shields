import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('build job not found')
  .get('/build.json?jobUrl=https://ci.eclipse.org/jgit/job/does-not-exist')
  .expectBadge({ label: 'build', message: 'instance or job not found' })

t.create('build found (view)')
  .get(
    '/build.json?jobUrl=https://ci.hibernate.org/view/Main/job/hibernate-search/job/main',
  )
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('build found (job)')
  .get('/build.json?jobUrl=https://ci.eclipse.org/jgit/job/jgit')
  .expectBadge({ label: 'build', message: isBuildStatus })
