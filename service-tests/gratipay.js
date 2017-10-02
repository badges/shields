'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'gratipay', title: 'Gratipay' });
module.exports = t;

t.create('Receiving')
  .get('/Gratipay.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('receives'),
    value: Joi.string().regex(/^\$[0-9]+(\.[0-9]{2})?\/week/)
  }));


t.create('Empty')
  .get('/Gratipay.json')
  .intercept(nock => nock('https://gratipay.com')
    .get('/Gratipay/public.json')
    .reply(200, { receiving: 0.00 })
  )
  .expectJSON({ name: 'receives', value: '$0/week'});
