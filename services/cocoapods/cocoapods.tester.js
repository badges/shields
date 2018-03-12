'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const {
    isMetric,
    isMetricOverTimePeriod,
    isIntegerPercentage,
    isVPlusDottedVersionAtLeastOne,
} = require('./helpers/validators');

const isPlatform = Joi.string().regex(/^(osx|ios|tvos|watchos)( \| (osx|ios|tvos|watchos))*$/);

const t = new ServiceTester({ id: 'cocoapods', title: 'Cocoa Pods' });
module.exports = t;


// version endpoint

t.create('version (valid)')
  .get('/v/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'pod',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('version (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({name: 'pod', value: 'not found'});

t.create('version (connection error)')
  .get('/v/AFNetworking.json')
  .networkOff()
  .expectJSON({name: 'pod', value: 'inaccessible'});

t.create('version (unexpected response)')
  .get('/v/AFNetworking.json')
  .intercept(nock => nock('https://trunk.cocoapods.org')
    .get('/api/v1/pods/AFNetworking/specs/latest')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'pod', value: 'invalid'});


// platform endpoint

t.create('platform (valid)')
  .get('/p/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'platform',
    value: isPlatform
  }));

t.create('platform (not found)')
  .get('/p/not-a-package.json')
  .expectJSON({name: 'platform', value: 'not found'});

t.create('platform (connection error)')
  .get('/p/AFNetworking.json')
  .networkOff()
  .expectJSON({name: 'platform', value: 'inaccessible'});

t.create('platform (unexpected response)')
  .get('/p/AFNetworking.json')
  .intercept(nock => nock('https://trunk.cocoapods.org')
    .get('/api/v1/pods/AFNetworking/specs/latest')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'platform', value: 'invalid'});


// license endpoint

t.create('license (valid)')
  .get('/l/AFNetworking.json')
  .expectJSON({name: 'license', value: 'MIT'});

t.create('license (not found)')
  .get('/l/not-a-package.json')
  .expectJSON({name: 'license', value: 'not found'});

t.create('license (connection error)')
  .get('/l/AFNetworking.json')
  .networkOff()
  .expectJSON({name: 'license', value: 'inaccessible'});

t.create('license (unexpected response)')
  .get('/l/AFNetworking.json')
  .intercept(nock => nock('https://trunk.cocoapods.org')
    .get('/api/v1/pods/AFNetworking/specs/latest')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'license', value: 'invalid'});


// doc percent endpoint

t.create('doc percent (valid)')
  .get('/metrics/doc-percent/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'docs',
    value: isIntegerPercentage
  }));

t.create('doc percent (null)')
  .get('/metrics/doc-percent/AFNetworking.json')
  .intercept(nock => nock('https://metrics.cocoapods.org')
    .get('/api/v1/pods/AFNetworking')
    .reply(200, '{"cocoadocs": {"doc_percent": null}}')
  )
  .expectJSON({name: 'docs', value: '0%'});;

t.create('doc percent (not found)')
  .get('/metrics/doc-percent/not-a-package.json')
  .expectJSON({name: 'docs', value: 'not found'});

t.create('doc percent (connection error)')
  .get('/metrics/doc-percent/AFNetworking.json')
  .networkOff()
  .expectJSON({name: 'docs', value: 'inaccessible'});

t.create('doc percent (unexpected response)')
  .get('/metrics/doc-percent/AFNetworking.json')
  .intercept(nock => nock('https://metrics.cocoapods.org')
    .get('/api/v1/pods/AFNetworking')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'docs', value: 'invalid'});


// downloads endpoints

t.create('downloads (valid, monthly)')
  .get('/dm/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetricOverTimePeriod
  }));

t.create('downloads (valid, weekly)')
  .get('/dw/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetricOverTimePeriod
  }));

t.create('downloads (valid, total)')
  .get('/dt/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetric
  }));

t.create('downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectJSON({name: 'downloads', value: 'not found'});

t.create('downloads (connection error)')
  .get('/dt/AFNetworking.json')
  .networkOff()
  .expectJSON({name: 'downloads', value: 'inaccessible'});

t.create('downloads (unexpected response)')
  .get('/dt/AFNetworking.json')
  .intercept(nock => nock('https://metrics.cocoapods.org')
    .get('/api/v1/pods/AFNetworking')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'downloads', value: 'invalid'});


// apps endpoints

t.create('apps (valid, weekly)')
  .get('/aw/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'apps',
    value: isMetricOverTimePeriod
  }));

t.create('apps (valid, total)')
  .get('/at/AFNetworking.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'apps',
    value: isMetric
  }));

t.create('apps (not found)')
  .get('/at/not-a-package.json')
  .expectJSON({name: 'apps', value: 'not found'});

t.create('apps (connection error)')
  .get('/at/AFNetworking.json')
  .networkOff()
  .expectJSON({name: 'apps', value: 'inaccessible'});

t.create('apps (unexpected response)')
  .get('/at/AFNetworking.json')
  .intercept(nock => nock('https://metrics.cocoapods.org')
    .get('/api/v1/pods/AFNetworking')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'apps', value: 'invalid'});
