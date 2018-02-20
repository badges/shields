'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const { isVPlusDottedVersionAtLeastOne } = require('./helpers/validators');
const { invalidJSON } = require('./helpers/response-fixtures');

const t = new ServiceTester({ id: 'itunes-international', title: 'iTunes International' });
module.exports = t;


t.create('iTunes version (valid)')
  .get('/v/fr/484006842.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'itunes app store',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('iTunes version (not found)')
  .get('/v/fr/9.json')
  .expectJSON({name: 'itunes app store', value: 'not found'});

t.create('iTunes version (invalid)')
  .get('/v/fr/x.json')
  .expectJSON({name: 'itunes app store', value: 'invalid'});

t.create('iTunes version (connection error)')
  .get('/v/fr/324684580.json')
  .networkOff()
  .expectJSON({name: 'itunes app store', value: 'inaccessible'});

t.create('iTunes version (unexpected response)')
  .get('/v/fr/324684580.json')
  .intercept(nock => nock('https://itunes.apple.com')
    .get('/lookup?id=324684580&country=fr')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'itunes app store', value: 'invalid'});

