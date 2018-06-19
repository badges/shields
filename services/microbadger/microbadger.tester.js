'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isFileSize } = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'microbadger', title: 'MicroBadger' });
module.exports = t;

t.create('image size without a specified tag')
  .get('/image-size/wikiwi/docker-build.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'image size',
    value: isFileSize
  }));

t.create('image size with a specified tag')
  .get('/image-size/kelseyhightower/helloworld/appengine.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'image size',
    value: isFileSize
  }));

t.create('layers without a specified tag')
  .get('/layers/_/hello-world.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'layers',
    value: Joi.number().integer().positive()
  }));

t.create('layers with a specified tag')
  .get('/layers/_/httpd/alpine.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'layers',
    value: Joi.number().integer().positive()
  }));

t.create('specified tag when repository has only one')
  .get('/layers/_/hello-world/wrong-tag.json')
  .expectJSON({ name: 'layers', value: 'not found' });

t.create('nonexistent repository')
  .get('/layers/_/unknown.json')
  .intercept(nock => nock('https://api.microbadger.com')
    .get('/v1/images/library/unknown')
    .reply(404)
  )
  .expectJSON({ name: 'layers', value: 'not found' });

t.create('nonexistent tag')
  .get('/layers/_/unknown/wrong-tag.json')
  .intercept(nock => nock('https://api.microbadger.com')
    .get('/v1/images/library/unknown')
    .reply(200, { Versions: [] })
  )
  .expectJSON({ name: 'layers', value: 'not found' });

t.create('server error')
  .get('/image-size/_/hello-world.json')
  .intercept(nock => nock('https://api.microbadger.com')
    .get('/v1/images/library/hello-world')
    .reply(500, 'Something went wrong')
  )
  .expectJSON({ name: 'image size', value: 'inaccessible' });

t.create('connection error')
  .get('/image-size/_/hello-world.json')
  .networkOff()
  .expectJSON({ name: 'image size', value: 'inaccessible' });

t.create('unexpected response')
  .get('/image-size/_/hello-world.json')
  .intercept(nock => nock('https://api.microbadger.com')
    .get('/v1/images/library/hello-world')
    .reply(invalidJSON)
  )
  .expectJSON({ name: 'image size', value: 'error' });

t.create('missing download size')
  .get('/image-size/puppet/puppetserver.json')
  .intercept(nock => nock('https://api.microbadger.com')
    .get('/v1/images/puppet/puppetserver')
    .reply(200, {})
  )
  .expectJSON({ name: 'image size', value: 'unknown' });
