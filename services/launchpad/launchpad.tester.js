'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'launchpad', title: 'Launchpad.net' })
module.exports = t;

t.create('gimp ppa version')
  .get('/ppa/version/otto-kesselgulasch/gimp/gimp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'launchpad',
    value: Joi.string().regex(/^\d\.\d/)
  }));

t.create('invalid version')
  .get('/ppa/version/invalid/invalid/invalid.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'launchpad',
    value: 'not found'
  }));
