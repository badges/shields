'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('build status (valid, without branch)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build status (valid, with branch)')
  .get('/5444c5ecb904a4b21567b0ff/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('build status (branch not found)')
  .get('/5444c5ecb904a4b21567b0ff/not-a-branch.json')
  .expectBadge({ label: 'shippable', message: 'branch not found' })

t.create('build status (not found)')
  .get('/not-a-build.json')
  .expectBadge({ label: 'shippable', message: 'not found' })

t.create('build status (unexpected status code)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .intercept(nock =>
    nock('https://api.shippable.com/')
      .get('/projects/5444c5ecb904a4b21567b0ff/branchRunStatus')
      .reply(200, '[{ "branchName": "master", "statusCode": 63 }]')
  )
  .expectBadge({ label: 'shippable', message: 'invalid response data' })
