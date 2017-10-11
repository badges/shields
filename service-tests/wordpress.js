'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'wordpress', title: 'Wordpress' });
module.exports = t;

t.create('supported version')
.get('/v/akismet.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('wordpress'),
  value: Joi.string()
}));

t.create('plugin version')
.get('/plugin/v/akismet.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('plugin'),
  value: Joi.string()
}));

t.create('plugin rating')
.get('/plugin/r/hestia.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('rating'),
  value: Joi.string()
}));

t.create('plugin downloads')
.get('/plugin/dt/hestia.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('downloads'),
  value: Joi.string()
}));

t.create('theme rating')
.get('/theme/r/hestia.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('rating'),
  value: Joi.string()
}));

t.create('theme downloads')
.get('/theme/dt/hestia.json')
.expectJSONTypes(Joi.object().keys({
  name: Joi.equal('downloads'),
  value: Joi.string()
}));
