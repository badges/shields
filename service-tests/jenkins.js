'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'jenkins', title: 'Jenkins' });
module.exports = t;

t.create('latest version')
  .get('/plugin/v/blueocean.json')
  .intercept(nock => nock('https://updates.jenkins-ci.org')
    .get('/current/update-center.actual.json')
    .reply(200, { plugins: { blueocean: { version: '1.1.6' } } })
  )
  .expectJSONTypes(Joi.object().keys({
    name: 'plugin',
    value: Joi.string().regex(/^v(.*)$/)
  }));

t.create('version 0')
  .get('/plugin/v/blueocean.json')
  .intercept(nock => nock('https://updates.jenkins-ci.org')
    .get('/current/update-center.actual.json')
    .reply(200, { plugins: { blueocean: { version: '0' } } })
  )
  .expectJSONTypes(Joi.object().keys({
    name: 'plugin',
    value: Joi.string().regex(/^v0$/)
  }));

t.create('inexistent artifact')
  .get('/plugin/v/inexistent-artifact-id.json')
  .intercept(nock => nock('https://updates.jenkins-ci.org')
    .get('/current/update-center.actual.json')
    .reply(200, { plugins: { blueocean: { version: '1.1.6' } } })
  )
  .expectJSON({ name: 'plugin', value: 'not found' });

t.create('connection error')
  .get('/plugin/v/blueocean.json')
  .networkOff()
  .expectJSON({ name: 'plugin', value: 'inaccessible' });
