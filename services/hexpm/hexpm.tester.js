'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isMetric,
  isMetricOverTimePeriod
} = require('../test-validators');

const isHexpmVersion = Joi.string().regex(/^v\d+.\d+.?\d?$/);

const t = new ServiceTester({ id: 'hexpm', title: 'Hex.pm' });
module.exports = t;

t.create('downloads per week')
  .get('/dw/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetricOverTimePeriod }));

t.create('downloads per day')
  .get('/dd/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetricOverTimePeriod }));

t.create('downloads in total')
  .get('/dt/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }));

t.create('version')
  .get('/v/cowboy.json')
  .expectJSONTypes(Joi.object().keys({ name: 'hex', value: isHexpmVersion }));

t.create('license')
  .get('/l/cowboy.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'license',
    value: Joi.string().required()
  }));

t.create('unknown repo')
  .get('/l/this-repo-does-not-exist.json')
  .expectJSON({ name: 'hex', value: 'invalid' });

t.create('connection error')
  .get('/l/cowboy.json')
  .networkOff()
  .expectJSON({ name: 'hex', value: 'inaccessible' });
