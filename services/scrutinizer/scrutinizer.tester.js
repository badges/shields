'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isIntegerPercentage
} = require('../test-validators');
const isBuildStatus = Joi.string().regex(/^(passing|failed|error|pending|unknown)$/);

const t = new ServiceTester({ id: 'scrutinizer', title: 'Scrutinizer' });
module.exports = t;

t.create('code quality')
  .get('/g/filp/whoops.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'code quality',
    value: Joi.number().positive(),
  }));

t.create('code quality (branch)')
  .get('/g/phpmyadmin/phpmyadmin/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'code quality',
    value: Joi.number().positive(),
  }));

t.create('code coverage')
  .get('/coverage/g/filp/whoops.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage,
  }));

t.create('code coverage (branch)')
  .get('/coverage/g/phpmyadmin/phpmyadmin/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage,
  }));

t.create('build')
  .get('/build/g/filp/whoops.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus,
  }));

t.create('build (branch)')
  .get('/build/g/phpmyadmin/phpmyadmin/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: isBuildStatus,
  }));

t.create('no response data')
  .get('/g/filp/whoops.json')
  .intercept(nock => nock('https://scrutinizer-ci.com')
    .get('/api/repositories/g/filp/whoops')
    .reply(200))
  .expectJSON({
     name: 'code quality',
     value: 'inaccessible',
  });

t.create('unexpected response data')
  .get('/coverage/g/filp/whoops.json')
  .intercept(nock => nock('https://scrutinizer-ci.com')
    .get('/api/repositories/g/filp/whoops')
    .reply(200, '{"unexpected":"data"}'))
  .expectJSON({
     name: 'coverage',
     value: 'invalid',
  });
