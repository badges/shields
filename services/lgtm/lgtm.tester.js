'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'lgtm', title: 'LGTM' })
module.exports = t;

t.create('total alerts for a project')
  .get('/alerts/g/apache/cloudstack.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'lgtm',
    value: Joi.string().regex(/^[0-9kM.]+ alerts?$/)
  }));

t.create('missing project')
  .get('/alerts/g/some-org/this-project-doesnt-exist.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'lgtm',
    value: 'project not found'
  }));

t.create('json missing alerts')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock => nock('https://lgtm.com')
    .get('/api/v0.1/project/g/apache/cloudstack/details')
    .reply(200, {}))
  .expectJSON({ name: 'lgtm', value: 'invalid' });

t.create('invalid json')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock => nock('https://lgtm.com')
    .get('/api/v0.1/project/g/apache/cloudstack/details')
    .reply(200, 'not a json string'))
  .expectJSON({ name: 'lgtm', value: 'invalid' });

t.create('lgtm inaccessible')
  .get('/alerts/g/apache/cloudstack.json')
  .networkOff()
  .expectJSON({ name: 'lgtm', value: 'inaccessible' });