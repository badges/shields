'use strict';

const assert = require('assert');
const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { Range } = require('semver');

const t = new ServiceTester({ id: 'node', title: 'Node' });
module.exports = t;

function assertIsSemverRange(value) {
  assert.doesNotThrow(() => {
    // eslint-disable-next-line no-new
    new Range(value);
  });
}

t.create('gets the node version of passport')
  .get('/v/passport.json')
  .expectJSONTypes(Joi.object({ name: 'node' }).unknown())
  .afterJSON(json => { assertIsSemverRange(json.value); });

t.create('gets the node version of @stdlib/stdlib')
  .get('/v/@stdlib/stdlib.json')
  .expectJSONTypes(Joi.object({ name: 'node' }).unknown())
  .afterJSON(json => { assertIsSemverRange(json.value); });

t.create("gets the tagged release's node version version of ionic")
  .get('/v/ionic/next.json')
  .expectJSONTypes(Joi.object({ name: 'node@next' }).unknown())
  .afterJSON(json => { assertIsSemverRange(json.value); });

t.create('gets the node version of passport from a custom registry')
  .get('/v/passport.json?registry_uri=https://registry.npmjs.com')
  .expectJSONTypes(Joi.object({ name: 'node' }).unknown())
  .afterJSON(json => { assertIsSemverRange(json.value); });

t.create("gets the tagged release's node version of @cycle/core")
  .get('/v/@cycle/core/canary.json')
  .expectJSONTypes(Joi.object({ name: 'node@canary' }).unknown())
  .afterJSON(json => { assertIsSemverRange(json.value); });

t.create('invalid package name')
  .get('/v/frodo-is-not-a-package.json')
  .expectJSON({ name: 'node', value: 'package not found' });
