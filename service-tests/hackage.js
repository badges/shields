'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const { isVPlusDottedVersionAtLeastOne } = require('./helpers/validators');

const t = new ServiceTester({ id: 'hackage', title: 'Hackage' });
module.exports = t;


t.create('hackage version (valid)')
  .get('/v/lens.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'hackage',
    value: isVPlusDottedVersionAtLeastOne,
  }));

t.create('hackage deps (valid)')
  .get('-deps/v/lens.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'dependencies',
    value: Joi.string().regex(/^(up to date|outdated)$/),
  }));

t.create('hackage version (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({name: 'hackage', value: 'not found'});

t.create('hackage version (not found)')
  .get('-deps/v/not-a-package.json')
  .expectJSON({name: 'dependencies', value: 'not found'});

t.create('hackage version (connection error)')
  .get('/v/lens.json')
  .networkOff()
  .expectJSON({name: 'hackage', value: 'inaccessible'});

t.create('hackage deps (connection error)')
  .get('-deps/v/lens.json')
  .networkOff()
  .expectJSON({name: 'dependencies', value: 'inaccessible'});

t.create('hackage version (unexpected response)')
  .get('/v/lens.json')
  .intercept(nock => nock('https://hackage.haskell.org')
    .get('/package/lens/lens.cabal')
    .reply(200, "")
  )
  .expectJSON({name: 'hackage', value: 'invalid'});
