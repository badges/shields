'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'clojars', title: 'clojars' });
module.exports = t;


t.create('clojars (valid)')
  .get('/v/prismic.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'clojars',
    value: /^\[prismic "([0-9][.]?)+"\]$/,  // note: https://github.com/badges/shields/pull/431
  }));

t.create('clojars (not found)')
  .get('/v/not-a-package.json')
  .expectJSON({name: 'clojars', value: 'not found'});

t.create('clojars (connection error)')
  .get('/v/jquery.json')
  .networkOff()
  .expectJSON({name: 'clojars', value: 'inaccessible'});

t.create('clojars (unexpected response)')
  .get('/v/prismic.json')
  .intercept(nock => nock('https://clojars.org')
    .get('/prismic/latest-version.json')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'clojars', value: 'invalid'});

t.create('clojars (error response)')
  .get('/v/prismic.json')
  .intercept(nock => nock('https://clojars.org')
    .get('/prismic/latest-version.json')
    .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({name: 'clojars', value: 'invalid'});
