'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const { isMetric } = require('./helpers/validators');

const t = new ServiceTester({ id: 'wordpress', title: 'Wordpress' });
module.exports = t;

t.create('supported version')
.get('/v/akismet.json')
.expectJSONTypes(Joi.object().keys({
  name: 'wordpress',
  value: Joi.string()
}));

t.create('plugin version')
.get('/plugin/v/akismet.json')
.expectJSONTypes(Joi.object().keys({
  name: 'plugin',
  value: Joi.string()
}));

t.create('plugin rating')
.get('/plugin/r/akismet.json')
.expectJSONTypes(Joi.object().keys({
  name: 'rating',
  value: Joi.string()
}));

t.create('plugin downloads')
.get('/plugin/dt/akismet.json')
.expectJSONTypes(Joi.object().keys({
  name: 'downloads',
  value: isMetric
}));

t.create('theme rating')
.get('/theme/r/hestia.json')
.expectJSONTypes(Joi.object().keys({
  name: 'rating',
  value: Joi.string()
}));

t.create('theme downloads')
.get('/theme/dt/hestia.json')
.expectJSONTypes(Joi.object().keys({
  name: 'downloads',
  value: isMetric
}));
