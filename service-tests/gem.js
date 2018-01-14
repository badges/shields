'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const { isVPlusDottedVersionAtLeastOne } = require('./helpers/validators');

const t = new ServiceTester({ id: 'gem', title: 'Ruby Gems' });
module.exports = t;


// version endpoint

t.create('version (valid)')
  .get('/v/formatador.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'gem',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('version (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({name: 'gem', value: 'not found'});

t.create('version (connection error)')
  .get('/v/formatador.json')
  .networkOff()
  .expectJSON({name: 'gem', value: 'inaccessible'});

t.create('version (unexpected response)')
.get('/v/formatador.json')
  .intercept(nock => nock('https://rubygems.org')
    .get('/api/v1/gems/formatador.json')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'gem', value: 'invalid'});


// users endpoint

t.create('version (valid)')
  .get('/u/raphink.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'gems',
    value: Joi.string().regex(/^[0-9]+$/)
  }));

t.create('users (not found)')
  .get('/u/not-a-package.json')
  .expectJSON({name: 'gems', value: 'not found'});

t.create('users (connection error)')
  .get('/u/raphink.json')
  .networkOff()
  .expectJSON({name: 'gems', value: 'inaccessible'});

t.create('users (unexpected response)')
.get('/u/raphink.json')
  .intercept(nock => nock('https://rubygems.org')
    .get('/api/v1/owners/raphink/gems.json')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'gems', value: 'invalid'});
