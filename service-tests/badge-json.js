'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { invalidJSON } = require('./helpers/response-fixtures');

const t = new ServiceTester({ id: 'badge-json', title: 'badge json', pathPrefix: '/json' });

module.exports = t;

t.create('invalid urlencoding')
  .get('/http%3A%2F%test.com%2Fbadge.json.json')
  .expectJSON({name: 'badge json', value: 'invalid'});

t.create('connection error')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json')
  .networkOff()
  .expectJSON({name: 'badge json', value: 'inaccessible'});

t.create('unexpected response')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'badge json', value: 'invalid'});

t.create('invalid badge json')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(function() {
      return [
        200,
        '{}',
        { 'Content-Type': 'application/json' }
      ];
    })
  )
  .expectJSON({name: 'badge json', value: 'invalid badge-json'});

t.create('label & value')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(function() {
      return [
        200,
        '{"label":"test","value":"success"}',
        { 'Content-Type': 'application/json' }
      ];
    })
  )
  .expectJSON({name: 'test', value: 'success'});
