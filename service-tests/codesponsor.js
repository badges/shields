'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'codesponsor', title: 'Code Sponsor' });
module.exports = t;

t.create('earnings on actual repo')
  .get('/YOURTOKEN/hopsoft/bg.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal(''),
    value: Joi.string().regex(/\$^[0-9]+(\.[0-9]+)?/)
  }));

t.create('display USD amount')
  .get('/YOURTOKEN/hopsoft/bg.json')
  .intercept(nock => nock('https://app.codesponsor.io')
    .get('/shield/hopsoft/bg')
    .reply(200, {
      distribution_cents: Joi.number(),
      ts: 1500824233
    })
  )
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal(''),
    value: Joi.string().regex(/\$^[0-9]+(\.[0-9]+)?/)
  }));

t.create('unknown repo')
  .get('/YOURTOKEN/hopsoft/this-does-not-exist.json')
  .intercept(nock => nock('https://app.codesponsor.io')
    .get('/shield/hopsoft/this-does-not-exist')
    .reply(200, {
      distribution_cents: 0,
      ts: 1500824233
    })
  )
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal(''),
    value: ' $0.00 '
  }));

t.create('connection error')
  .get('/YOURTOKEN/hopsoft/bg.json')
  .networkOff()
  .expectJSON({ name: 'sponsor', value: 'inaccessible' });
