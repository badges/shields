'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id : 'gratipay', title: 'Gratipay' });
module.exports = t;

t.create('Receiving')
  .get('/Gratipay.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tips'),
    value: Joi.string().regex(/^\$[0-9]+(\.[0-9]{2})?\/week/)
  }));

