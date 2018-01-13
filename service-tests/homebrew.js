'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { isVPlusTripleDottedVersion } = require('./helpers/validators.js');

const t = new ServiceTester({ id: 'homebrew', title: 'homebrew' });
module.exports = t;


t.create('homebrew (valid)')
  .get('/v/cake.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'homebrew',
    value: isVPlusTripleDottedVersion,
  }));

t.create('homebrew (invalid)')
  .get('/v/not-a-package.json')
  .expectJSON({name: 'homebrew', value: 'not found'});

t.create('homebrew (connection error)')
  .get('/v/cake.json')
  .networkOff()
  .expectJSON({name: 'homebrew', value: 'inaccessible'});

t.create('homebrew (unexpected response)')
  .get('/v/cake.json')
  .intercept(nock => nock('http://formulae.brew.sh')
    .get('/formula/cake/version')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'homebrew', value: 'invalid'});
