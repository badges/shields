'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const isBuildStatus = Joi.string().regex(/^(passing|failing|cancelled|unstable|pending|skipped|none)$/);

const t = new ServiceTester({ id: 'shippable', title: 'Shippable CI' });
module.exports = t;


t.create('build status (valid, without branch)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus
  }));

t.create('build status (valid, with branch)')
  .get('/5444c5ecb904a4b21567b0ff/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus
  }));

t.create('build status (not found)')
  .get('/not-a-build.json')
  .expectJSON({name: 'build', value: 'not found'});

t.create('build status (connection error)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .networkOff()
  .expectJSON({name: 'build', value: 'inaccessible'});

t.create('build status (unexpected response)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .intercept(nock => nock('https://api.shippable.com/')
    .get('/projects/5444c5ecb904a4b21567b0ff/badge')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'build', value: 'invalid'});
