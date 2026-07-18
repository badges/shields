import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('build job not found')
  .get('/build.json?jobUrl=https://ci.freebsd.org/job/does-not-exist')
  .expectBadge({ label: 'build', message: 'instance or job not found' })

t.create('build found (view)')
  .get(
    '/build.json?jobUrl=https://ci.freebsd.org/view/all/job/FreeBSD-main-amd64-test',
  )
  .expectBadge({ label: 'build', message: isBuildStatus })

t.create('build found (job)')
  .get('/build.json?jobUrl=https://ci.freebsd.org/job/FreeBSD-main-amd64-test')
  .expectBadge({ label: 'build', message: isBuildStatus })
