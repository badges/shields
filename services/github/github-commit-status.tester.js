'use strict'

const { invalidJSON } = require('../response-fixtures')
const t = (module.exports = require('../tester').createServiceTester())

t.create('commit status - commit in branch')
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'in master',
    color: 'brightgreen',
  })

t.create(
  'commit status - checked commit is identical with the newest commit in branch'
)
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(200, { status: 'identical' })
  )
  .expectJSON({
    name: 'commit status',
    value: 'in master',
    color: 'brightgreen',
  })

t.create('commit status - commit not in branch')
  .get(
    '/badges/shields/master/960c5bf72d7d1539fcd453343eed3f8617427a41.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'commit or branch not found',
    color: 'lightgrey',
  })

t.create('commit status - unknown commit id')
  .get(
    '/atom/atom/v1.27.1/7dfb45eb61a48a4ce18a0dd2e31f944ed4467ae3.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'not in v1.27.1',
    color: 'yellow',
  })

t.create('commit status - unknown branch')
  .get(
    '/badges/shields/this-branch-does-not-exist/b551a3a8daf1c48dba32a3eab1edf99b10c28863.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'commit or branch not found',
    color: 'lightgrey',
  })

t.create('commit status - no common ancestor between commit and branch')
  .get(
    '/badges/shields/master/b551a3a8daf1c48dba32a3eab1edf99b10c28863.json?style=_shields_test'
  )
  .expectJSON({
    name: 'commit status',
    value: 'no common ancestor',
    color: 'lightgrey',
  })

t.create('commit status - invalid JSON')
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(invalidJSON)
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    color: 'lightgrey',
  })

t.create('commit status - network error')
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .networkOff()
  .expectJSON({
    name: 'commit status',
    value: 'inaccessible',
    color: 'red',
  })

t.create('commit status - github server error')
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(500)
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    color: 'lightgrey',
  })

t.create('commit status - 404 with empty JSON form github')
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(404, {})
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    color: 'lightgrey',
  })

t.create('commit status - 404 with invalid JSON form github')
  .get(
    '/badges/shields/master/5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c.json?style=_shields_test'
  )
  .intercept(nock =>
    nock('https://api.github.com')
      .get(
        '/repos/badges/shields/compare/master...5d4ab86b1b5ddfb3c4a70a70bd19932c52603b8c'
      )
      .reply(404, invalidJSON)
  )
  .expectJSON({
    name: 'commit status',
    value: 'invalid',
    color: 'lightgrey',
  })
