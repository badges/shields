'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators')
const colorscheme = require('../../lib/colorscheme.json')
const {
  queryIndex,
  nuGetV3VersionJsonWithDash,
  nuGetV3VersionJsonFirstCharZero,
  nuGetV3VersionJsonFirstCharNotZero,
} = require('../nuget-fixtures')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({ id: 'myget', title: 'MyGet' })
module.exports = t

// downloads

t.create('total downloads (valid)')
  .get('/mongodb/dt/MongoDB.Driver.Core.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'downloads',
      value: isMetric,
    })
  )

t.create('total downloads (not found)')
  .get('/mongodb/dt/not-a-real-package.json')
  .expectJSON({ name: 'downloads', value: 'not found' })

t.create('total downloads (connection error)')
  .get('/mongodb/dt/MongoDB.Driver.Core.json')
  .networkOff()
  .expectJSON({ name: 'downloads', value: 'inaccessible' })

t.create('total downloads (unexpected first response)')
  .get('/mongodb/dt/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'downloads', value: 'invalid' })

t.create('total downloads (unexpected second response)')
  .get('/mongodb/dt/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'downloads', value: 'invalid' })

// version

t.create('version (valid)')
  .get('/mongodb/v/MongoDB.Driver.Core.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'mongodb',
      value: isVPlusDottedVersionNClauses,
    })
  )

t.create('version (mocked, yellow badge)')
  .get('/mongodb/v/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB,
  })

t.create('version (mocked, orange badge)')
  .get('/mongodb/v/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB,
  })

t.create('version (mocked, blue badge)')
  .get('/mongodb/v/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB,
  })

t.create('version (not found)')
  .get('/foo/v/not-a-real-package.json')
  .expectJSON({ name: 'foo', value: 'not found' })

t.create('version (connection error)')
  .get('/mongodb/v/MongoDB.Driver.Core.json')
  .networkOff()
  .expectJSON({ name: 'mongodb', value: 'inaccessible' })

t.create('version (unexpected first response)')
  .get('/mongodb/v/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'mongodb', value: 'invalid' })

t.create('version (unexpected second response)')
  .get('/mongodb/v/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'mongodb', value: 'invalid' })

// version (pre)

t.create('version (pre) (valid)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'mongodb',
      value: isVPlusDottedVersionNClausesWithOptionalSuffix,
    })
  )

t.create('version (pre) (mocked, yellow badge)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB,
  })

t.create('version (pre) (mocked, orange badge)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB,
  })

t.create('version (pre) (mocked, blue badge)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json?style=_shields_test')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'mongodb',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB,
  })

t.create('version (pre) (not found)')
  .get('/foo/vpre/not-a-real-package.json')
  .expectJSON({ name: 'foo', value: 'not found' })

t.create('version (pre) (connection error)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json')
  .networkOff()
  .expectJSON({ name: 'mongodb', value: 'inaccessible' })

t.create('version (pre) (unexpected first response)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'mongodb', value: 'invalid' })

t.create('version (pre) (unexpected second response)')
  .get('/mongodb/vpre/MongoDB.Driver.Core.json')
  .intercept(nock =>
    nock('https://www.myget.org')
      .get('/F/mongodb/api/v3/index.json')
      .reply(200, queryIndex)
  )
  .intercept(nock =>
    nock('https://api-v2v3search-0.nuget.org')
      .get(
        '/query?q=packageid:mongodb.driver.core&prerelease=true&semVerLevel=2'
      )
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'mongodb', value: 'invalid' })
