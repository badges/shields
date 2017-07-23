'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'codesponsor', title: 'Code Sponsor' });
module.exports = t;

t.create('earnings on actual repo')
  .get('/hopsoft/bg.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('sponsor'),
    value: Joi.string().regex(/^[0-9]+(\.[0-9]+)? BTC/)
  }));

t.create('display bitcoin amount')
  .get('/hopsoft/bg.json')
  .intercept(nock => nock('https://app.codesponsor.io')
    .get('/shield/hopsoft/bg')
    .reply(200, {
      bitcoin: 0.004359,
      ts: 1500824233
    })
  )
  .expectJSON({ name: 'sponsor', value: '0.004359 BTC' });

t.create('unknown repo')
  .get('/hopsoft/this-does-not-exist.json')
  .intercept(nock => nock('https://app.codesponsor.io')
    .get('/shield/hopsoft/this-does-not-exist')
    .reply(200, {
      bitcoin: 0,
      ts: 1500824233
    })
  )
  .expectJSON({ name: 'sponsor', value: '0 BTC' });

t.create('connection error')
  .get('/hopsoft/bg.json')
  .networkOff()
  .expectJSON({ name: 'sponsor', value: 'inaccessible' });
