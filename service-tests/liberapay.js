'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'liberapay', title: 'Liberapay' });
module.exports = t;

t.create('Receiving')
  .get('/Liberapay/receives.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'receives',
    value: Joi.string().regex(/^[0-9]+(\.[0-9]{2})?[ A-Za-z]{4}\/week/)
  }));

t.create('Empty')
  .get('/Liberapay/receives.json')
  .intercept(nock => nock('https://liberapay.com')
    .get('/Liberapay/public.json')
    .reply(200, { receiving: 0.00 })
  )
  .expectJSON({ name: 'receives', value: 'anonymous'});
