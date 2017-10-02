'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'crates', title: 'crates.io' });
module.exports = t;

t.create('license')
  .get('/l/libc.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('license'),
    value: Joi.equal('MIT/Apache-2.0')
  }));

t.create('license (with version)')
  .get('/l/libc/0.2.31.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('license'),
    value: Joi.equal('MIT/Apache-2.0')
  }));
