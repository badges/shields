'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('./helpers/validators');
const colorscheme = require('../lib/colorscheme.json');
const {
  queryIndex,
  nuGetV3VersionJsonWithDash,
  nuGetV3VersionJsonFirstCharZero,
  nuGetV3VersionJsonFirstCharNotZero,
} = require('./helpers/nuget-fixtures.js');
const { invalidJSON } = require('./helpers/response-fixtures');

const t = new ServiceTester({ id: 'nuget', title: 'NuGet' });
module.exports = t;


// downloads

t.create('total downloads (valid)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetric,
  }));

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({name: 'downloads', value: 'not found'});

t.create('total downloads (connection error)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .networkOff()
  .expectJSON({name: 'downloads', value: 'inaccessible'});

t.create('total downloads (unexpected first response)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'downloads', value: 'invalid'});

t.create('total downloads (unexpected second response)')
  .get('/dt/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'downloads', value: 'invalid'});


// version

t.create('version (valid)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'nuget',
    value: isVPlusDottedVersionNClauses,
  }));

t.create('version (mocked, yellow badge)')
  .get('/v/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB
  });

t.create('version (mocked, orange badge)')
  .get('/v/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB
  });

t.create('version (mocked, blue badge)')
  .get('/v/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB
  });

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({name: 'nuget', value: 'not found'});

t.create('version (connection error)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .networkOff()
  .expectJSON({name: 'nuget', value: 'inaccessible'});

t.create('version (unexpected first response)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'nuget', value: 'invalid'});

t.create('version (unexpected second response)')
  .get('/v/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'nuget', value: 'invalid'});


// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'nuget',
    value: isVPlusDottedVersionNClausesWithOptionalSuffix,
  }));

  t.create('version (pre) (mocked, yellow badge)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(200, nuGetV3VersionJsonWithDash)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB
  });

t.create('version (pre) (mocked, orange badge)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(200, nuGetV3VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB
  });

t.create('version (pre) (mocked, blue badge)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json?style=_shields_test')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(200, nuGetV3VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'nuget',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB
  });

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({name: 'nuget', value: 'not found'});

t.create('version (pre) (connection error)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .networkOff()
  .expectJSON({name: 'nuget', value: 'inaccessible'});

t.create('version (pre) (unexpected first response)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'nuget', value: 'invalid'});

t.create('version (pre) (unexpected second response)')
  .get('/vpre/Microsoft.AspNetCore.Mvc.json')
  .intercept(nock => nock('https://api.nuget.org')
    .get("/v3/index.json")
    .reply(200, queryIndex)
  )
  .intercept(nock => nock('https://api-v2v3search-0.nuget.org')
    .get("/query?q=packageid:microsoft.aspnetcore.mvc&prerelease=true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'nuget', value: 'invalid'});
