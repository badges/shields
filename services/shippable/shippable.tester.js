import { isBuildStatus } from '../build-status.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'Shippable',
  title: 'Shippable',
  pathPrefix: '/shippable',
})

t.create('build status (valid)')
  .get('/5444c5ecb904a4b21567b0ff/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build status (branch not found)')
  .get('/5444c5ecb904a4b21567b0ff/not-a-branch.json')
  .expectBadge({ label: 'shippable', message: 'branch not found' })

t.create('build status (build not found)')
  .get('/not-a-build/master.json')
  .expectBadge({ label: 'shippable', message: 'not found' })

t.create('build status (unexpected status code)')
  .get('/5444c5ecb904a4b21567b0ff/master.json')
  .intercept(nock =>
    nock('https://api.shippable.com/')
      .get('/projects/5444c5ecb904a4b21567b0ff/branchRunStatus')
      .reply(200, '[{ "branchName": "master", "statusCode": 63 }]')
  )
  .expectBadge({ label: 'shippable', message: 'invalid response data' })

t.create('build status (no branch redirect)')
  .get('/5444c5ecb904a4b21567b0ff.svg')
  .expectRedirect('/shippable/5444c5ecb904a4b21567b0ff/master.svg')
