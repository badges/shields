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
  nuGetV2VersionJsonWithDash,
  nuGetV2VersionJsonFirstCharZero,
  nuGetV2VersionJsonFirstCharNotZero
} = require('./helpers/nuget-fixtures.js');
const { invalidJSON } = require('./helpers/response-fixtures');

const t = new ServiceTester({ id: 'chocolatey', title: 'Chocolatey' });
module.exports = t;


// downloads

t.create('total downloads (valid)')
  .get('/dt/scriptcs.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'chocolatey',
    value: isMetric,
  }));

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({name: 'chocolatey', value: 'not found'});

t.create('total downloads (connection error)')
  .get('/dt/scriptcs.json')
  .networkOff()
  .expectJSON({name: 'chocolatey', value: 'inaccessible'});

t.create('total downloads (unexpected response)')
  .get('/dt/scriptcs.json')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsLatestVersion%20eq%20true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'chocolatey', value: 'invalid'});


// version

t.create('version (valid)')
  .get('/v/scriptcs.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'chocolatey',
    value: isVPlusDottedVersionNClauses,
  }));

t.create('version (mocked, yellow badge)')
  .get('/v/scriptcs.json?style=_shields_test')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonWithDash)
  )
  .expectJSON({
    name: 'chocolatey',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB
  });

t.create('version (mocked, orange badge)')
  .get('/v/scriptcs.json?style=_shields_test')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'chocolatey',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB
  });

t.create('version (mocked, blue badge)')
  .get('/v/scriptcs.json?style=_shields_test')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'chocolatey',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB
  });

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({name: 'chocolatey', value: 'not found'});

t.create('version (connection error)')
  .get('/v/scriptcs.json')
  .networkOff()
  .expectJSON({name: 'chocolatey', value: 'inaccessible'});

t.create('version (unexpected response)')
  .get('/v/scriptcs.json')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsLatestVersion%20eq%20true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'chocolatey', value: 'invalid'});


// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/scriptcs.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'chocolatey',
    value: isVPlusDottedVersionNClausesWithOptionalSuffix,
  }));

t.create('version (pre) (mocked, yellow badge)')
  .get('/vpre/scriptcs.json?style=_shields_test')
  .intercept(nock => nock('https://www.chocolatey.org')
  .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonWithDash)
  )
  .expectJSON({
    name: 'chocolatey',
    value: 'v1.2-beta',
    colorB: colorscheme.yellow.colorB
  });

t.create('version (pre) (mocked, orange badge)')
  .get('/vpre/scriptcs.json?style=_shields_test')
  .intercept(nock => nock('https://www.chocolatey.org')
  .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharZero)
  )
  .expectJSON({
    name: 'chocolatey',
    value: 'v0.35',
    colorB: colorscheme.orange.colorB
  });

t.create('version (pre) (mocked, blue badge)')
  .get('/vpre/scriptcs.json?style=_shields_test')
  .intercept(nock => nock('https://www.chocolatey.org')
  .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, nuGetV2VersionJsonFirstCharNotZero)
  )
  .expectJSON({
    name: 'chocolatey',
    value: 'v1.2.7',
    colorB: colorscheme.blue.colorB
  });

t.create('version (pre) (not found)')
  .get('/vpre/not-a-real-package.json')
  .expectJSON({name: 'chocolatey', value: 'not found'});

t.create('version (pre) (connection error)')
  .get('/vpre/scriptcs.json')
  .networkOff()
  .expectJSON({name: 'chocolatey', value: 'inaccessible'});

t.create('version (pre) (unexpected response)')
  .get('/vpre/scriptcs.json')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(invalidJSON)
  )
  .expectJSON({name: 'chocolatey', value: 'invalid'});
