'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { invalidJSON } = require('../response-fixtures');

const isRequireStatus = Joi.string().regex(/^(up to date|outdated|insecure|unknown)$/);

const t = new ServiceTester({ id: 'requires', title: 'Requires.io' });
module.exports = t;


t.create('requirements (valid, without branch)')
  .get('/github/celery/celery.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'requirements',
    value: isRequireStatus
  }));

t.create('requirements (valid, with branch)')
  .get('/github/celery/celery/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'requirements',
    value: isRequireStatus
  }));

t.create('requirements (not found)')
  .get('/github/PyvesB/EmptyRepo.json')
  .expectJSON({name: 'requirements', value: 'not found'});

t.create('requirements (connection error)')
  .get('/github/celery/celery.json')
  .networkOff()
  .expectJSON({name: 'requirements', value: 'inaccessible'});

t.create('requirements (unexpected response)')
  .get('/github/celery/celery.json')
  .intercept(nock => nock('https://requires.io/')
    .get('/api/v1/status/github/celery/celery')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'requirements', value: 'invalid'});
