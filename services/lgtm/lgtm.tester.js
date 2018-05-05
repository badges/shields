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
  .expectJSON({
    name: 'lgtm',
    value: 'project not found'
  });

t.create('no alerts')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock => nock('https://lgtm.com')
    .get('/api/v0.1/project/g/apache/cloudstack/details')
    .reply(200, {alerts: 0}))
  .expectJSON({ name: 'lgtm', value: '0 alerts' });

t.create('single alert')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock => nock('https://lgtm.com')
    .get('/api/v0.1/project/g/apache/cloudstack/details')
    .reply(200, {alerts: 1}))
  .expectJSON({ name: 'lgtm', value: '1 alert' });

t.create('multiple alerts')
  .get('/alerts/g/apache/cloudstack.json')
  .intercept(nock => nock('https://lgtm.com')
    .get('/api/v0.1/project/g/apache/cloudstack/details')
    .reply(200, {alerts: 123}))
  .expectJSON({ name: 'lgtm', value: '123 alerts' });

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