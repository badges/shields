'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('valid repo -- compliant')
  .get('/github.com/fsfe/reuse-tool.json')
  .expectBadge({
    label: 'reuse',
    message: 'compliant',
    color: 'green',
  })

t.create('valid repo -- non-compliant')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'non-compliant' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'non-compliant',
    color: 'red',
  })

t.create('valid repo -- checking')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'checking' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'checking',
    color: 'brightgreen',
  })

t.create('valid repo -- unregistered')
  .get('/github.com/username/repo.json')
  .intercept(nock =>
    nock('https://api.reuse.software/status')
      .get('/github.com/username/repo')
      .reply(200, { status: 'unregistered' })
  )
  .expectBadge({
    label: 'reuse',
    message: 'unregistered',
    color: 'red',
  })

t.create('invalid repo').get('/github.com/repo/invalid-repo.json').expectBadge({
  label: 'reuse',
  message: 'Not a Git repository',
})
