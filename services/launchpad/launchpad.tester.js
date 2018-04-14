'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'launchpad', title: 'Launchpad.net' })
module.exports = t;

t.create('gimp ppa version')
  .get('/ppa/version/otto-kesselgulasch/gimp/gimp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'version',
    value: Joi.string()
  }));

t.create('gimp ppa downloads')
  .get('/ppa/downloads/otto-kesselgulasch/gimp/gimp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads 24h',
    value: Joi.number()
  }));

t.create('invalid version')
  .get('/ppa/version/invalid/invalid/invalid.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'version',
    value: 'invalid'
  }));

t.create('invalid downloads')
  .get('/ppa/downloads/invalid/invalid/invalid.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'downloads 24h',
    value: 'invalid'
  }));
