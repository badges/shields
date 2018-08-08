'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isSemver } = require('../test-validators');

const t = new ServiceTester({ id: 'elm-package', title: 'ELM PACKAGE' });
module.exports = t;

t.create('gets the package version of elm-lang/core')
  .get('/v/elm-lang/core.json')
  .expectJSONTypes(Joi.object().keys({ name: 'elm-package', value: isSemver }));

t.create('invalid package name')
  .get('/v/elm-community/frodo-is-not-a-package.json')
  .expectJSON({ name: 'elm-package', value: 'invalid' });
