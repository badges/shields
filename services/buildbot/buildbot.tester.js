import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('buildbot (valid)')
  .get('/amd64-rhel8-dockerlibrary.json?baseUrl=https://buildbot.mariadb.org')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('buildbot (no builds)')
  .get('/does-not-exist.json?baseUrl=https://buildbot.mariadb.org')
  .expectBadge({ label: 'build', message: 'no builds found' })
