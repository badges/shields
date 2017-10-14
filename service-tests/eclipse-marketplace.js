'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
	  isMetric,
	  isMetricOverTimePeriod,
	  isVPlusDottedVersionAtLeastOne
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'eclipse-marketplace', title: 'Eclipse' });
module.exports = t;

t.create('total marketplace downloads')
  .get('/dt/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetric,
  }));

t.create('monthly marketplace downloads')
  .get('/dm/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads',
    value: isMetricOverTimePeriod,
  }));

t.create('marketplace version')
  .get('/v/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'eclipse marketplace',
    value: isVPlusDottedVersionAtLeastOne,
  }));

t.create('favorites count')
  .get('/favorites/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'favorites',
    value: Joi.number().integer().positive(),
  }));
