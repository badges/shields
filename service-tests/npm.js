'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { isSemver } = require('./helpers/validators');
const colorscheme = require('../lib/colorscheme.json');

const t = new ServiceTester({ id: 'npm', title: 'NPM' });
module.exports = t;
const colorsB = Object.assign({}, ...Object.keys(colorscheme).map(color => ({ [color]: colorscheme[color].colorB })));

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

t.create('public domain license')
  .get('/l/redux-auth.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'WTFPL', colorB: colorsB.blue });

t.create('copyleft license')
  .get('/l/trianglify.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'GPL-3.0', colorB: colorsB.blue });

t.create('permissive license')
  .get('/l/express.json?style=_shields_test')
  .expectJSON({ name: 'license', value: 'MIT', colorB: colorsB.blue });
