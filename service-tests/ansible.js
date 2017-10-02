'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'ansible', title: 'Ansible Galaxy' });
module.exports = t;

t.create('ansible role name')
 .get('/role/14542.json')
 .expectJSONTypes(Joi.object().keys({
   name: Joi.equal('role'),
   value: Joi.equal('openwisp.openwisp2')
 }));

t.create('ansible role download counts')
 .get('/role/d/14542.json')
 .expectJSONTypes(Joi.object().keys({
   name: Joi.equal('role downloads'),
   value: Joi.string().regex(/^[0-9]+[kMG]?$/)
 }));

t.create('unkown role')
 .get('/role/000.json')
 .expectJSONTypes(Joi.object().keys({
   name: Joi.equal('role'),
   value: Joi.equal('not found')
 }));

t.create('connection error')
  .get('/role/14542.json')
  .networkOff()
  .expectJSON({ name: 'role', value: 'errored' });
