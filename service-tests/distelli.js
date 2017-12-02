'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'distelli', title: 'Distelli' });
module.exports = t;

t.create('build status')
  .get('/build/org/application-name.json?token=xxx')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal(
      'unknown',
      'waiting',
      'queued',
      'running',
      'success',
      'failed',
      'inaccessible'
    )
  }));

t.create('deploy status')
  .get('/deploy/org/application-name.json?token=xxx')
  .expectJSONTypes(Joi.object().keys({
    name: 'deploy',
    value: Joi.equal(
      'unknown',
      'waiting',
      'queued',
      'running',
      'success',
      'failed',
      'inaccessible'
    )
  }));
