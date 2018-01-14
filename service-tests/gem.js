'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const { isVPlusDottedVersionAtLeastOne } = require('./helpers/validators');

const t = new ServiceTester({ id: 'gem', title: 'Ruby Gems' });
module.exports = t;


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
