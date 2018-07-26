'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isMetric } = require('../test-validators');

const t = new ServiceTester({ id: 'ansible', title: 'Ansible Galaxy' });
module.exports = t;

t.create('ansible role name')
 .get('/role/14542.json')
 .expectJSON({ name: 'role', value: 'openwisp.openwisp2' });

t.create('ansible role download counts')
 .get('/role/d/14542.json')
 .expectJSONTypes(Joi.object().keys({ name: 'role downloads', value: isMetric }));

t.create('unkown role')
 .get('/role/000.json')
 .expectJSON({ name: 'role', value: 'not found' });

t.create('connection error')
  .get('/role/14542.json')
  .networkOff()
  .expectJSON({ name: 'role', value: 'errored' });

t.create('no response data')
  .get('/role/14542.json')
  .intercept(nock => nock('https://galaxy.ansible.com')
    .get('/api/v1/roles/14542/')
    .reply(200)
  )
  .expectJSON({ name: 'role', value: 'not found' });
