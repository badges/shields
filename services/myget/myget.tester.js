'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const {
  isMetric,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const {
  queryIndex,
  nuGetV3VersionJsonWithDash,
  nuGetV3VersionJsonFirstCharZero,
  nuGetV3VersionJsonFirstCharNotZero,
} = require('../nuget-fixtures')
const { invalidJSON } = require('../response-fixtures')

const t = (module.exports = new ServiceTester({
  id: 'myget',
  title: 'MyGet',
  pathPrefix: '',
}))

// downloads

t.create('total downloads (valid)')
  .get('/myget/mongodb/dt/MongoDB.Driver.Core.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (tenant)')
  .get('/dotnet.myget/dotnet-coreclr/dt/Microsoft.DotNet.CoreCLR.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/myget/mongodb/dt/not-a-real-package.json')
  .expectJSON({ name: 'downloads', value: 'package not found' })

// This tests the erroring behavior in regular-update.
t.create('total downloads (connection error)')
  .get('/myget/mongodb/dt/MongoDB.Driver.Core.json')
  .networkOff()
  .expectJSON({
    name: 'downloads',
    value: 'intermediate resource inaccessible',
  })

// This tests the erroring behavior in regular-update.
t.create('total downloads (unexpected first response)')
  .get('/myget/mongodb/dt/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(invalidJSON)
  )
  .expectJSON({
    name: 'downloads',
    value: 'unparseable intermediate json response',
  })

// version

t.create('version (valid)')
  .get('/myget/mongodb/v/MongoDB.Driver.Core.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'mongodb',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('total downloads (tenant)')
  .get('/dotnet.myget/dotnet-coreclr/v/Microsoft.DotNet.CoreCLR.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dotnet-coreclr',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (mocked, yellow badge)')
  .get('/myget/mongodb/v/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2-beta',
    color: 'yellow',
  })

t.create('version (mocked, orange badge)')
  .get('/myget/mongodb/v/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v0.35',
    color: 'orange',
  })

t.create('version (mocked, blue badge)')
  .get('/myget/mongodb/v/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2.7',
    color: 'blue',
  })

t.create('version (not found)')
  .get('/myget/foo/v/not-a-real-package.json')
  .expectJSON({ name: 'myget', value: 'package not found' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/myget/mongodb/vpre/MongoDB.Driver.Core.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'mongodb',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (pre) (mocked, yellow badge)')
  .get('/myget/mongodb/vpre/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2-beta',
    color: 'yellow',
  })

t.create('version (pre) (mocked, orange badge)')
  .get('/myget/mongodb/vpre/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v0.35',
    color: 'orange',
  })

t.create('version (pre) (mocked, blue badge)')
  .get('/myget/mongodb/vpre/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2.7',
    color: 'blue',
  })

t.create('version (pre) (not found)')
  .get('/myget/foo/vpre/not-a-real-package.json')
  .expectJSON({ name: 'myget', value: 'package not found' })
