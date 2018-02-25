'use strict';

// const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { invalidJSON } = require('./helpers/response-fixtures');

const t = new ServiceTester({ id: 'badge-json', title: 'badge json', pathPrefix: '/json' });

function genJsonResponse(obj) {
  return function() {
    return [
      200,
      JSON.stringify(obj),
      { 'Content-Type': 'application/json' }
    ];
  };
}


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
    .reply(genJsonResponse({}))
  )
  .expectJSON({name: 'badge json', value: 'invalid badge-json'});

t.create('label & value')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json?style=_shields_test')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(genJsonResponse({label:"test", value:"success"}))
  )
  .expectJSON({
    name: 'test',
    value: 'success',
    colorB: '#9f9f9f'  // default
  });

t.create('label, value, & class')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json?style=_shields_test')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(genJsonResponse({label:"test", value:"success", valueClass:"success"}))
  )
  .expectJSON({
    name: 'test',
    value: 'success',
    colorB: '#4c1'  // success
  });

 t.create('label, value, class, & colorB')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json?style=_shields_test')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(genJsonResponse({label:"test", value:"success", valueClass:"success", colorB:"#D00D00"}))
  )
  .expectJSON({
    name: 'test',
    value: 'success',
    colorB: '#D00D00' // colorB override
  });

 t.create('label, value, class, colorB, & colorB param')
  .get('/http%3A%2F%2Ftest.com%2Fbadge.json.json?style=_shields_test&colorB=C001E0')
  .intercept(nock => nock('http://test.com')
    .get('/badge.json')
    .reply(genJsonResponse({label:"test", value:"success", valueClass:"success", colorB:"#D00D00"}))
  )
  .expectJSON({
    name: 'test',
    value: 'success',
    colorB: '#C001E0' // colorB param
  });
