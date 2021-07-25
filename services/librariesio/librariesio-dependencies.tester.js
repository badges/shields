import { ServiceTester } from '../tester.js'
import { isDependencyState } from '../test-validators.js'
export const t = new ServiceTester({
  id: 'LibrariesIoDependencies',
  title: 'LibrariesIoDependencies',
  pathPrefix: '/librariesio',
})

t.create('dependencies for package (project name contains dot)')
  .timeout(10000)
  .get('/release/nuget/Newtonsoft.Json.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('dependencies for package with version')
  .timeout(10000)
  .get('/release/hex/phoenix/1.0.3.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('dependencies for scoped npm package')
  .timeout(10000)
  .get('/release/npm/@babel/core.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('dependencies for scoped npm package with version')
  .timeout(10000)
  .get('/release/npm/@babel/core/7.0.0-rc.0.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('version not found')
  .timeout(10000)
  .get('/release/hex/phoenix/9.9.99.json')
  .expectBadge({
    label: 'dependencies',
    message: 'package or version not found',
  })

t.create('package not found')
  .timeout(10000)
  .get('/release/hex/invalid/4.0.4.json')
  .expectBadge({
    label: 'dependencies',
    message: 'package or version not found',
  })

t.create('dependencies for repo')
  .timeout(10000)
  .get('/github/pyvesb/notepad4e.json')
  .expectBadge({
    label: 'dependencies',
    message: isDependencyState,
  })

t.create('repo not found')
  .timeout(10000)
  .get('/github/foobar/is-not-a-repo.json')
  .expectBadge({
    label: 'dependencies',
    message: 'repo not found',
  })
