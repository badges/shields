'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const isUptimeStatus = Joi.string().regex(/^(paused|not checked yet|up|seems down|down)$/);
const { isPercentage } = require('../test-validators');
const { invalidJSON } = require('../response-fixtures');

const t = new ServiceTester({ id: 'uptimerobot', title: 'Uptime Robot' });
module.exports = t;


t.create('Uptime Robot: Status (valid)')
  .get('/status/m778918918-3e92c097147760ee39d02d36.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'status',
    value: isUptimeStatus,
  }));

t.create('Uptime Robot: Status (invalid, correct format)')
  .get('/status/m777777777-333333333333333333333333.json')
  .expectJSON({name: 'status', value: 'api_key not found.'});

t.create('Uptime Robot: Status (invalid, incorrect format)')
  .get('/status/not-a-service.json')
  .expectJSON({name: 'status', value: 'must use a monitor key'});

t.create('Uptime Robot: Status (unspecified error)')
  .get('/status/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(200, '{"stat": "fail"}')
  )
  .expectJSON({name: 'status', value: 'vendor error'});

t.create('Uptime Robot: Status (connection error)')
  .get('/status/m778918918-3e92c097147760ee39d02d36.json')
  .networkOff()
  .expectJSON({name: 'status', value: 'inaccessible'});

t.create('Uptime Robot: Status (service unavailable)')
  .get('/status/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(503, '{"error": "oh noes!!"}')
  )
  .expectJSON({name: 'status', value: 'inaccessible'});

t.create('Uptime Robot: Status (unexpected response, valid json)')
  .get('/status/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(200, "[]")
  )
  .expectJSON({name: 'status', value: 'invalid'});

t.create('Uptime Robot: Status (unexpected response, invalid json)')
  .get('/status/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'status', value: 'inaccessible'});

t.create('Uptime Robot: Percentage (valid)')
  .get('/ratio/m778918918-3e92c097147760ee39d02d36.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'uptime',
    value: isPercentage,
  }));

t.create('Uptime Robot: Percentage (valid, with numberOfDays param)')
  .get('/ratio/7/m778918918-3e92c097147760ee39d02d36.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'uptime',
    value: isPercentage,
  }));

t.create('Uptime Robot: Percentage (invalid, correct format)')
  .get('/ratio/m777777777-333333333333333333333333.json')
  .expectJSON({name: 'uptime', value: 'api_key not found.'});

t.create('Uptime Robot: Percentage (invalid, incorrect format)')
  .get('/ratio/not-a-service.json')
  .expectJSON({name: 'uptime', value: 'must use a monitor key'});

t.create('Uptime Robot: Percentage (unspecified error)')
  .get('/ratio/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(200, '{"stat": "fail"}')
  )
  .expectJSON({name: 'uptime', value: 'vendor error'});

t.create('Uptime Robot: Percentage (connection error)')
  .get('/ratio/m778918918-3e92c097147760ee39d02d36.json')
  .networkOff()
  .expectJSON({name: 'uptime', value: 'inaccessible'});

t.create('Uptime Robot: Percentage (service unavailable)')
  .get('/ratio/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(503, '{"error": "oh noes!!"}')
  )
  .expectJSON({name: 'uptime', value: 'inaccessible'});

t.create('Uptime Robot: Percentage (unexpected response, valid json)')
  .get('/ratio/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(200, "[]")
  )
  .expectJSON({name: 'uptime', value: 'invalid'});

t.create('Uptime Robot: Percentage (unexpected response, invalid json)')
  .get('/ratio/m778918918-3e92c097147760ee39d02d36.json')
  .intercept(nock => nock('https://api.uptimerobot.com')
    .post('/v2/getMonitors')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'uptime', value: 'inaccessible'});
