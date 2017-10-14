'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
	  isMetric,
	  isMetricOverPeriod,
	  isVPlusDottedVersionAtLeastOne
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'eclipse-marketplace', title: 'Eclipse' });
module.exports = t;

t.create('total marketplace downloads')
  .get('/dt/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: isMetric,
  }));

t.create('monthly marketplace downloads')
  .get('/dm/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: isMetricOverPeriod,
  }));

t.create('marketplace version')
  .get('/v/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('eclipse marketplace'),
    value: isVPlusDottedVersionAtLeastOne,
  }));

t.create('favorited count')
  .get('/favorited/notepad4e.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('favorited'),
    value: Joi.number().integer().positive(),
  }));
