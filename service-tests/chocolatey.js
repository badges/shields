'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isMetric,
  isVPlusDottedVersionNClauses
} = require('./helpers/validators');

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
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'chocolatey', value: 'invalid'});


// version

t.create('version (valid)')
  .get('/v/scriptcs.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'chocolatey',
    value: isVPlusDottedVersionNClauses,
  }));

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
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'chocolatey', value: 'invalid'});


// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/scriptcs.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'chocolatey',
    value: isVPlusDottedVersionNClauses,
  }));

t.create('version (pre) (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({name: 'chocolatey', value: 'not found'});

t.create('version (pre) (connection error)')
  .get('/vpre/scriptcs.json')
  .networkOff()
  .expectJSON({name: 'chocolatey', value: 'inaccessible'});

t.create('version (pre) (unexpected response)')
  .get('/vpre/scriptcs.json')
  .intercept(nock => nock('https://www.chocolatey.org')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27scriptcs%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'chocolatey', value: 'invalid'});
