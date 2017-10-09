'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { isSemver } = require('./helpers/validators');

const t = new ServiceTester({ id: 'npm', title: 'NPM' });
module.exports = t;

t.create('gets the package version of left-pad')
  .get('/v/left-pad.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }));

t.create('gets the package version of @cycle/core')
  .get('/v/@cycle/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }));

t.create('gets the tagged package version of npm')
  .get('/v/npm/next.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@next', value: isSemver }));

t.create('gets the tagged package version of @cycle/core')
  .get('/v/@cycle/core/canary.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }));

t.create('invalid package name')
  .get('/v/frodo-is-not-a-package.json')
  .expectJSON({ name: 'npm', value: 'invalid' });
