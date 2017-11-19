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

t.create('gets the package version of left-pad from a custom registry')
  .get('/v/left-pad.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm', value: isSemver }));

t.create('gets the tagged package version of @cycle/core')
  .get('/v/@cycle/core/canary.json')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }));

t.create('gets the tagged package version of @cycle/core from a custom registry')
  .get('/v/@cycle/core/canary.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'npm@canary', value: isSemver }));

t.create('gets the license of express')
  .get('/l/express.json')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: 'MIT' }));

t.create('gets the license of express from a custom registry')
  .get('/l/express.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object().keys({ name: 'license', value: 'MIT' }));

t.create('invalid package name')
  .get('/v/frodo-is-not-a-package.json')
  .expectJSON({ name: 'npm', value: 'invalid' });
