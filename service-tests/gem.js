'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const {
  isVPlusDottedVersionAtLeastOne,
  isMetric
} = require('./helpers/validators');
const { invalidJSON } = require('./helpers/response-fixtures');
const isOrdinalNumber = Joi.string().regex(/^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ)$/);
const isOrdinalNumberDaily = Joi.string().regex(/^[1-9][0-9]+(ᵗʰ|ˢᵗ|ⁿᵈ|ʳᵈ) daily$/);

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
    .reply(invalidJSON)
  )
  .expectJSON({name: 'gem', value: 'invalid'});


// downloads endpoints

// total downloads
t.create('total downloads (valid)')
  .get('/dt/rails.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetric
  }));

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectJSON({name: 'downloads', value: 'not found'});

t.create('total downloads (connection error)')
  .get('/dt/rails.json')
  .networkOff()
  .expectJSON({name: 'downloads', value: 'inaccessible'});

t.create('total downloads (unexpected response)')
  .get('/dt/rails.json')
  .intercept(nock => nock('https://rubygems.org')
    .get('/api/v1/gems/rails.json')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'downloads', value: 'invalid'});


// version downloads
t.create('version downloads (valid, stable version)')
  .get('/dv/rails/stable.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads@stable',
    value: isMetric
  }));

t.create('version downloads (valid, specific version)')
  .get('/dv/rails/4.1.0.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads@4.1.0',
    value: isMetric
  }));

t.create('version downloads (package not found)')
  .get('/dv/not-a-package/4.1.0.json')
  .expectJSON({name: 'downloads@4.1.0', value: 'not found'});

t.create('version downloads (valid package, invalid version)')
  .get('/dv/rails/not-a-version.json')
  .expectJSON({name: 'downloads', value: 'invalid'});

t.create('version downloads (valid package, version not specified)')
  .get('/dv/rails.json')
  .expectJSON({name: 'downloads', value: 'invalid'});

t.create('version downloads (connection error)')
  .get('/dv/rails/4.1.0.json')
  .networkOff()
  .expectJSON({name: 'downloads@4.1.0', value: 'inaccessible'});

t.create('version downloads (unexpected response)')
  .get('/dv/rails/4.1.0.json')
  .intercept(nock => nock('https://rubygems.org')
    .get('/api/v1/versions/rails.json')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'downloads@4.1.0', value: 'invalid'});


// latest version downloads
t.create('latest version downloads (valid)')
  .get('/dtv/rails.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads@latest',
    value: isMetric
  }));

t.create('latest version downloads (not found)')
  .get('/dtv/not-a-package.json')
  .expectJSON({name: 'downloads@latest', value: 'not found'});

t.create('latest version downloads (connection error)')
  .get('/dtv/rails.json')
  .networkOff()
  .expectJSON({name: 'downloads@latest', value: 'inaccessible'});

t.create('latest version downloads (unexpected response)')
  .get('/dtv/rails.json')
  .intercept(nock => nock('https://rubygems.org')
    .get('/api/v1/gems/rails.json')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'downloads@latest', value: 'invalid'});


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
    .reply(invalidJSON)
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
      .reply(invalidJSON)
    )
    .expectJSON({name: 'rank', value: 'invalid'});
