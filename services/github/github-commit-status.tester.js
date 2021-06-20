import { invalidJSONString } from '../response-fixtures.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('commit status - commit in branch')
  .get('/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json')
  .expectBadge({
    label: 'commit status',
    message: 'in master',
    color: 'brightgreen',
  })

t.create(
  'commit status - checked commit is identical with the newest commit in branch'
)
  .get('/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(200, { status: 'identical' })
  )
  .expectBadge({
    label: 'commit status',
    message: 'in master',
    color: 'brightgreen',
  })

t.create('commit status - commit not in branch')
  .get('/badges/shields/master/960c5bf72d7d1539fcd453343eed3f8617427a41.json')
  .expectBadge({
    label: 'commit status',
    message: 'commit or branch not found',
    color: 'red',
  })

t.create('commit status - unknown commit id')
  .get('/atom/atom/v1.27.1/7dfb45eb61a48a4ce18a0dd2e31f944ed4467ae3.json')
  .expectBadge({
    label: 'commit status',
    message: 'not in v1.27.1',
    color: 'yellow',
  })

t.create('commit status - unknown branch')
  .get(
    '/badges/shields/this-branch-does-not-exist/b551a3a8daf1c48dba32a3eab1edf99b10c28863.json'
  )
  .expectBadge({
    label: 'commit status',
    message: 'commit or branch not found',
    color: 'red',
  })

t.create('commit status - no common ancestor between commit and branch')
  .get('/badges/shields/master/b551a3a8daf1c48dba32a3eab1edf99b10c28863.json')
  .expectBadge({
    label: 'commit status',
    message: 'no common ancestor',
    color: 'red',
  })

// Since the service is responsible for parsing its error response, this tests
// the service, not BaseJsonService.
t.create('commit status - 404 with invalid JSON form github')
  .get('/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json')
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(404, invalidJSONString)
  )
  .expectBadge({
    label: 'commit status',
    message: 'unparseable json response',
    color: 'lightgrey',
  })
