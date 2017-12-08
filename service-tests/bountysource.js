'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'bountysource', title: 'Bountysource' });
module.exports = t;


t.create('bounties (valid)')
  .get('/team/mozilla-core/activity.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'bounties',
    value: Joi.number().integer().positive()
  }));

t.create('bounties (invalid team)')
  .get('/team/not-a-real-team/activity.json')
  .expectJSON({
    name: 'bounties',
    value: 'not found'
  });

t.create('bounties (connection error)')
  .get('/team/mozilla-core/activity.json')
  .networkOff()
  .expectJSON({name: 'bounties', value: 'inaccessible'});

t.create('bounties (unexpected response)')
  .get('/team/mozilla-core/activity.json')
  .intercept(nock => nock('https://api.bountysource.com')
    .get('/teams/mozilla-core')
    .reply(200, "{{{{{invalid json}}")
  )
  .expectJSON({name: 'bounties', value: 'invalid'});

t.create('bounties (error response)')
  .get('/team/mozilla-core/activity.json')
  .intercept(nock => nock('https://api.bountysource.com')
    .get('/teams/mozilla-core')
    .reply(500, '{"error":"oh noes!!"}')
  )
  .expectJSON({
    name: 'bounties',
    value: 'invalid'
  });
