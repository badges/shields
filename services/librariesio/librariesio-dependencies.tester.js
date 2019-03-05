'use strict'

const { isDependencyState } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('dependencies for releases')
  .get('/release/hex/phoenix/1.0.3.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('dependencies for releases (project name contains dot)')
  .get('/release/nuget/Newtonsoft.Json.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('dependencies for github')
  .get('/github/pyvesb/notepad4e.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('release not found')
  .get('/release/hex/invalid/4.0.4.json')
  .expectBadge({
    label: 'dependencies',
    message: 'not available',
  })

t.create('no response data')
  .get('/github/phoenixframework/phoenix.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/github/phoenixframework/phoenix/dependencies')
      .reply(200)
  )
  .expectBadge({
    label: 'dependencies',
    message: 'invalid',
  })
