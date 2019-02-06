'use strict'

const Joi = require('joi')
const { ServiceTester } = require('../tester')
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const {
  queryIndex,
  nuGetV3VersionJsonWithDash,
  nuGetV3VersionJsonFirstCharZero,
  nuGetV3VersionJsonFirstCharNotZero,
} = require('../nuget-fixtures')
const { invalidJSON } = require('../response-fixtures')

const t = (module.exports = new ServiceTester({ id: 'nuget', title: 'NuGet' }))

// downloads

t.create('total downloads (valid)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({ name: 'downloads', value: 'package not found' })

t.create('total downloads (unexpected second response)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'downloads', value: 'unparseable json response' })

// version

t.create('version (valid)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nuget',
      value: isVPlusDottedVersionNClauses,
    })
  )

t.create('version (mocked, yellow badge)')
  .get('/v/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2-beta',
    color: 'yellow',
  })

t.create('version (mocked, orange badge)')
  .get('/v/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v0.35',
    color: 'orange',
  })

t.create('version (mocked, blue badge)')
  .get('/v/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2.7',
    color: 'blue',
  })

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({ name: 'nuget', value: 'package not found' })

t.create('version (unexpected second response)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'nuget', value: 'unparseable json response' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'nuget',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (pre) (mocked, yellow badge)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2-beta',
    color: 'yellow',
  })

t.create('version (pre) (mocked, orange badge)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v0.35',
    color: 'orange',
  })

t.create('version (pre) (mocked, blue badge)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2.7',
    color: 'blue',
  })

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({ name: 'nuget', value: 'package not found' })

t.create('version (pre) (unexpected second response)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock =>
    nock('https://api.nuget.org')
      .get('/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid%3Amicrosoft.aspnetcore.mvc&prerelease=true&semVerLevel=2'
      )
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'nuget', value: 'unparseable json response' })
