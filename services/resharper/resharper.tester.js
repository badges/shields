'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isMetric,
  isVPlusDottedVersionNClauses,
  isVPlusDottedVersionNClausesWithOptionalSuffix,
} = require('../test-validators');
const colorscheme = require('../../lib/colorscheme.json');
const {
  nuGetV2VersionJsonWithDash,
  nuGetV2VersionJsonFirstCharZero,
  nuGetV2VersionJsonFirstCharNotZero
} = require('../nuget-fixtures');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'resharper', title: 'ReSharper' });
module.exports = t;


// downloads

t.create('total downloads (valid)')
  .get('/dt/ReSharper.Nuke.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetric,
  }));

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({name: 'downloads', value: 'not found'});

t.create('total downloads (connection error)')
  .get('/dt/ReSharper.Nuke.json')
  .networkOff()
  .expectJSON({name: 'downloads', value: 'inaccessible'});

t.create('total downloads (unexpected response)')
  .get('/dt/ReSharper.Nuke.json')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsLatestVersion%20eq%20true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'downloads', value: 'invalid'});


// version

t.create('version (valid)')
  .get('/v/ReSharper.Nuke.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'resharper',
    value: isVPlusDottedVersionNClauses,
  }));

t.create('version (mocked, yellow badge)')
  .get('/v/ReSharper.Nuke.json?style=_shields_test')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonWithDash)
  )
  .expectJSON({
    name: 'resharper',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB
  });

t.create('version (mocked, orange badge)')
  .get('/v/ReSharper.Nuke.json?style=_shields_test')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'resharper',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB
  });

t.create('version (mocked, blue badge)')
  .get('/v/ReSharper.Nuke.json?style=_shields_test')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'resharper',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB
  });

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({name: 'resharper', value: 'not found'});

t.create('version (connection error)')
  .get('/v/ReSharper.Nuke.json')
  .networkOff()
  .expectJSON({name: 'resharper', value: 'inaccessible'});

t.create('version (unexpected response)')
  .get('/v/ReSharper.Nuke.json')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsLatestVersion%20eq%20true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'resharper', value: 'invalid'});


// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/ReSharper.Nuke.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'resharper',
    value: isVPlusDottedVersionNClausesWithOptionalSuffix,
  }));

t.create('version (pre) (mocked, yellow badge)')
  .get('/vpre/ReSharper.Nuke.json?style=_shields_test')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
  .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonWithDash)
  )
  .expectJSON({
    name: 'resharper',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB
  });

t.create('version (pre) (mocked, orange badge)')
  .get('/vpre/ReSharper.Nuke.json?style=_shields_test')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
  .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'resharper',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB
  });

t.create('version (pre) (mocked, blue badge)')
  .get('/vpre/ReSharper.Nuke.json?style=_shields_test')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
  .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'resharper',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB
  });

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({name: 'resharper', value: 'not found'});

t.create('version (pre) (connection error)')
  .get('/vpre/ReSharper.Nuke.json')
  .networkOff()
  .expectJSON({name: 'resharper', value: 'inaccessible'});

t.create('version (pre) (unexpected response)')
  .get('/vpre/ReSharper.Nuke.json')
  .intercept(nock => nock('https://resharper-plugins.jetbrains.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ReSharper.Nuke%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'resharper', value: 'invalid'});
