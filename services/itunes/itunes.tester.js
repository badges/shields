'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const { isVPlusDottedVersionAtLeastOne } = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'itunes', title: 'iTunes' });
module.exports = t;


t.create('iTunes version (valid)')
  .get('/v/324684580.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'itunes app store',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('iTunes version (not found)')
  .get('/v/9.json')
  .expectJSON({name: 'itunes app store', value: 'not found'});

t.create('iTunes version (invalid)')
  .get('/v/x.json')
  .expectJSON({name: 'itunes app store', value: 'invalid'});

t.create('iTunes version (connection error)')
  .get('/v/324684580.json')
  .networkOff()
  .expectJSON({name: 'itunes app store', value: 'inaccessible'});

t.create('iTunes version (unexpected response)')
  .get('/v/324684580.json')
  .intercept(nock => nock('https://itunes.apple.com')
    .get('/lookup?id=324684580')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'itunes app store', value: 'invalid'});

