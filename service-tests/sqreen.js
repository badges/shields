'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'sqreen', title: 'Sqreen' })
module.exports = t;

t.create('protection status for www.sqreen.io')
  .get('/https://www.sqreen.io.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('sqreen'),
    value: Joi.equal('protected')
  }));

t.create('get protection status from someone known to not be protected by sqreen')
  .get('/https://www.example.com.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('sqreen'),
    value: Joi.equal('unprotected')
  }));

t.create('get protection status from an invalid domain')
  .get('/foobar.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('sqreen'),
    value: Joi.equal('invalid domain')
  }));
