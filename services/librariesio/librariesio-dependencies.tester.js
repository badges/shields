'use strict'

const { ServiceTester } = require('../tester')
const { isDependencyState } = require('../test-validators')
const t = (module.exports = new ServiceTester({
  id: 'LibrariesIoDependencies',
  title: 'LibrariesIoDependencies',
  pathPrefix: '/librariesio',
}))

t.create('dependencies for package (project name contains dot)')
  .get('/release/nuget/Newtonsoft.Json.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('dependencies for package with version')
  .get('/release/hex/phoenix/1.0.3.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('version not found')
  .get('/release/hex/phoenix/9.9.99.json')
  .expectBadge({
    label: 'dependencies',
    message: 'package or version not found',
  })

t.create('package not found')
  .get('/release/hex/invalid/4.0.4.json')
  .expectBadge({
    label: 'dependencies',
    message: 'package or version not found',
  })

t.create('dependencies for repo')
  .get('/github/pyvesb/notepad4e.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('repo not found')
  .get('/github/foobar/is-not-a-repo.json')
  .expectBadge({
    label: 'dependencies',
    message: 'repo not found',
  })
