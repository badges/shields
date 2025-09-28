import { ServiceTester } from '../tester.js'
import {
  isMetric,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} from '../test-validators.js'
import { invalidJSON } from '../response-fixtures.js'

export const t = new ServiceTester({
  id: 'myget',
  title: 'MyGet',
  pathPrefix: '',
})

// downloads

t.create('total downloads (valid)')
  .get('/myget/mongodb/dt/MongoDB.Driver.Core.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('total downloads (tenant)')
  .get('/vs-devcore.myget/vs-devcore/dt/MicroBuild.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
  })

t.create('total downloads (not found)')
  .get('/myget/mongodb/dt/not-a-real-package.json')
  .expectBadge({ label: 'downloads', message: 'package not found' })

// This tests the erroring behavior in getCachedResource.
t.create('total downloads (connection error)')
  .get('/myget/mongodb/dt/MongoDB.Driver.Core.json')
  .networkOff()
  .expectBadge({
    label: 'downloads',
    message: 'inaccessible',
  })

// This tests the erroring behavior in getCachedResource.
t.create('total downloads (unexpected first response)')
  .get('/myget/mongodb/dt/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(invalidJSON),
  )
  .expectBadge({
    label: 'downloads',
    message: 'unparseable intermediate json response',
  })

// version

t.create('version (valid)')
  .get('/myget/mongodb/v/MongoDB.Driver.Core.json')
  .expectBadge({
    label: 'mongodb',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (tenant)')
  .get('/tizen.myget/dotnet/v/Tizen.NET.json')
  .expectBadge({
    label: 'dotnet',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (not found)')
  .get('/myget/foo/v/not-a-real-package.json')
  .expectBadge({ label: 'myget', message: 'package not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/myget/mongodb/vpre/MongoDB.Driver.Core.json')
  .expectBadge({
    label: 'mongodb',
    message: isVPlusDottedVersionNClausesWithOptionalSuffix,
  })

t.create('version (pre) (not found)')
  .get('/myget/foo/vpre/not-a-real-package.json')
  .expectBadge({ label: 'myget', message: 'package not found' })
