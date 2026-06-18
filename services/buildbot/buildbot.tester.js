import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

const isBuildbotStatus = isBuildStatus

t.create('buildbot (valid)')
  .get(
    '/amd64-rhel8-dockerlibrary.json?baseUrl=https://buildbot.mariadb.org',
  )
  .expectBadge({
    label: 'build',
    message: isBuildbotStatus,
  })

t.create('buildbot (valid, mocked)')
  .get('/my-builder.json?baseUrl=https://buildbot.example.org')
  .intercept(nock =>
    nock('https://buildbot.example.org')
      .get('/api/v2/builders/my-builder/builds')
      .query({ limit: '1', order: '-number' })
      .reply(200, {
        builds: [{ complete: true, results: 0 }],
      }),
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('buildbot (builder not found)')
  .get('/does-not-exist.json?baseUrl=https://buildbot.mariadb.org')
  .expectBadge({ label: 'build', message: 'builder not found' })
