import { ServiceTester } from '../tester.js'
import {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'
import { invalidJSON } from '../response-fixtures.js'

export const t = new ServiceTester({ id: 'nuget', title: 'NuGet' })

const queryIndex = JSON.stringify({
  resources: [
    {
      '@id': 'https://api-v2v3search-0.nuget.org/query',
      '@type': 'SearchQueryService',
    },
  ],
})

const nuGetV3VersionJsonBuildMetadataWithDash = JSON.stringify({
  data: [
    {
      totalDownloads: 0,
      versions: [
        {
          version: '1.16.0+388',
        },
        {
          version: '1.17.0+1b81349-429',
        },
      ],
    },
  ],
})

// downloads

t.create('total downloads (valid)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

t.create('total downloads (unexpected second response)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock =>
    nock('https://api.nuget.org').get('/v3/index.json').reply(200, queryIndex),
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2',
      )
      .reply(invalidJSON),
  )
  .expectBadge({ label: 'downloads', message: 'unparseable json response' })

// version

t.create('version (valid)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .expectBadge({
    label: 'nuget',
    message: isVPlusDottedVersionNClauses,
  })

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectBadge({ label: 'nuget', message: 'package not found' })

t.create('version (unexpected second response)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock =>
    nock('https://api.nuget.org').get('/v3/index.json').reply(200, queryIndex),
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2',
      )
      .reply(invalidJSON),
  )
  .expectBadge({ label: 'nuget', message: 'unparseable json response' })

// https://github.com/badges/shields/issues/4219
t.create('version (build metadata with -)')
  .get('/v/MongoFramework.json')
  .intercept(nock =>
    nock('https://api.nuget.org').get('/v3/index.json').reply(200, queryIndex),
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get('/query?q=packageid%3Amongoframework&prerelease=true&semVerLevel=2')
      .reply(200, nuGetV3VersionJsonBuildMetadataWithDash),
  )
  .expectBadge({
    label: 'nuget',
    message: 'v1.17.0',
    color: 'blue',
  })

// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .expectBadge({
    label: 'nuget',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectBadge({ label: 'nuget', message: 'package not found' })
