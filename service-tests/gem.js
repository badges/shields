'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const { isVPlusDottedVersionAtLeastOne } = require('./helpers/validators');
const isOrdinalNumber = Joi.string().regex(/^[0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/);
const isOrdinalNumberDaily = Joi.string().regex(/^[0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/);

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


// rank endpoint

t.create('total rank (valid)')
  .get('/rt/rspec-puppet-facts.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'rank',
    value: isOrdinalNumber
  }));

t.create('daily rank (valid)')
  .get('/rd/rspec-puppet-facts.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'rank',
    value: isOrdinalNumberDaily
  }));

t.create('rank (not found)')
  .get('/rt/not-a-package.json')
  .expectJSON({name: 'rank', value: 'not found'});

t.create('rank (connection error)')
  .get('/rt/rspec-puppet-facts.json')
  .networkOff()
  .expectJSON({name: 'rank', value: 'inaccessible'});

t.create('rank (unexpected response)')
  .get('/rt/rspec-puppet-facts.json')
    .intercept(nock => nock('http://bestgems.org')
      .get('/api/v1/gems/rspec-puppet-facts/total_ranking.json')
      .reply(200, "{{{{{invalid json}}")
    )
    .expectJSON({name: 'rank', value: 'invalid'});
