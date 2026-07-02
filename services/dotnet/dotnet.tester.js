import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

t.create('target frameworks (stable)')
  .get('/v/Humanizer.Core.json')
  .expectBadge({
    label: 'dotnet',
    message: 'net48 | net8.0 | netstandard2.0',
    color: 'blue',
  })

t.create('target frameworks (prerelease)')
  .get('/vpre/Humanizer.Core.json')
  .expectBadge({
    label: 'dotnet',
    message: 'net48 | net8.0 | netstandard2.0',
    color: 'blue',
  })

t.create('single target framework')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .expectBadge({
    label: 'dotnet',
    message: 'netstandard2.0',
    color: 'blue',
  })

t.create('target frameworks (mocked)')
  .get('/v/mock-package.json')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/registration5-gz-semver2/mock-package/index.json')
      .reply(200, {
        items: [
          {
            '@id':
              'https://api.nuget.org/v3/registration5-gz-semver2/mock-package/page/0.json',
          },
        ],
      })
      .get('/v3/registration5-gz-semver2/mock-package/page/0.json')
      .reply(200, {
        items: [
          {
            catalogEntry: {
              version: '1.0.0',
              dependencyGroups: [{ targetFramework: 'net6.0' }],
            },
          },
        ],
      }),
  )
  .expectBadge({
    label: 'dotnet',
    message: 'net6.0',
    color: 'blue',
  })

t.create('package not found')
  .get('/v/not-a-real-package-name.json')
  .expectBadge({
    label: 'dotnet',
    message: 'package not found',
  })
