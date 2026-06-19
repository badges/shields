import { isBuildStatus } from '../build-status.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('build (valid user project)')
  .get('/msuchy/nanoblogger/nanoblogger.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build (valid group project)')
  .get('/%40copr/copr/copr-backend.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build (valid, mocked)')
  .get('/owner/project/package.json')
  .intercept(nock =>
    nock('https://copr.fedorainfracloud.org')
      .get('/api_3/package')
      .query({
        ownername: 'owner',
        projectname: 'project',
        packagename: 'package',
        with_latest_build: 'True',
      })
      .reply(200, {
        builds: {
          latest: {
            state: 'succeeded',
          },
        },
      }),
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('build (not found)')
  .get('/not-a-user/not-a-project/not-a-package.json')
  .expectBadge({ label: 'build', message: 'project or package not found' })
