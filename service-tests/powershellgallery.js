'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isMetric,
  isVPlusDottedVersionNClauses
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'powershellgallery', title: 'PowerShell Gallery' });
module.exports = t;


// downloads

t.create('total downloads (valid)')
  .get('/dt/ACMESharp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'powershellgallery',
    value: isMetric,
  }));

t.create('total downloads (not found)')
  .get('/dt/not-a-real-package.json')
  .expectJSON({name: 'powershellgallery', value: 'not found'});

t.create('total downloads (connection error)')
  .get('/dt/ACMESharp.json')
  .networkOff()
  .expectJSON({name: 'powershellgallery', value: 'inaccessible'});

t.create('total downloads (unexpected response)')
  .get('/dt/ACMESharp.json')
  .intercept(nock => nock('https://www.powershellgallery.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ACMESharp%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'powershellgallery', value: 'invalid'});


// version

t.create('version (valid)')
  .get('/v/ACMESharp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'powershellgallery',
    value: isVPlusDottedVersionNClauses,
  }));

t.create('version (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({name: 'powershellgallery', value: 'not found'});

t.create('version (connection error)')
  .get('/v/ACMESharp.json')
  .networkOff()
  .expectJSON({name: 'powershellgallery', value: 'inaccessible'});

t.create('version (unexpected response)')
  .get('/v/ACMESharp.json')
  .intercept(nock => nock('https://www.powershellgallery.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ACMESharp%27%20and%20IsLatestVersion%20eq%20true")
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'powershellgallery', value: 'invalid'});


// version (pre)

t.create('version (pre) (valid)')
  .get('/vpre/ACMESharp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'powershellgallery',
    value: isVPlusDottedVersionNClauses,
  }));

t.create('version (pre) (not found)')
  .get('/v/not-a-real-package.json')
  .expectJSON({name: 'powershellgallery', value: 'not found'});

t.create('version (pre) (connection error)')
  .get('/vpre/ACMESharp.json')
  .networkOff()
  .expectJSON({name: 'powershellgallery', value: 'inaccessible'});

t.create('version (pre) (unexpected response)')
  .get('/vpre/ACMESharp.json')
  .intercept(nock => nock('https://www.powershellgallery.com')
    .get("/api/v2/Packages()?$filter=Id%20eq%20%27ACMESharp%27%20and%20IsAbsoluteLatestVersion%20eq%20true")
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'powershellgallery', value: 'invalid'});
