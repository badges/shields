'use strict'

const { isBuildStatus } = require('../build-status')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'codeship',
  title: 'codeship',
}))

t.create('codeship (valid, no branch)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('codeship (valid, with branch)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('codeship (repo not found)')
  .get('/not-a-repo.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('codeship (branch not found)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/not-a-branch.json')
  .expectBadge({ label: 'build', message: 'branch not found' })

t.create('codeship (connection error)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .networkOff()
  .expectBadge({ label: 'build', message: 'inaccessible' })

t.create('codeship (unexpected response header)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .intercept(nock =>
    nock('https://codeship.com')
      .get('/projects/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/status')
      .reply(200, '', {
        'content-disposition': 'foo',
      })
  )
  .expectBadge({ label: 'build', message: 'unknown' })

t.create('codeship (unexpected response body)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .intercept(nock =>
    nock('https://codeship.com')
      .get('/projects/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/status')
      .reply(200, '')
  )
  .expectBadge({ label: 'build', message: 'invalid' })
