'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'launchpad', title: 'Launchpad.net' })
module.exports = t;

t.create('connection error')
  .get('/ppa/version/otto-kesselgulasch/gimp/gimp.json')
  .networkOff()
  .expectJSON({
    name: 'launchpad',
    value: 'inaccessible'
  });

t.create('gimp ppa version')
  .get('/ppa/version/otto-kesselgulasch/gimp/gimp.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'launchpad',
    value: Joi.string().regex(/^v\d+\.\d/)
  }));

t.create('invalid name')
  .get('/ppa/version/otto-kesselgulasch/gimp/invalid.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'launchpad',
    value: 'no package'
  }));

t.create('invalid version')
  .get('/ppa/version/invalid/invalid/invalid.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'launchpad',
    value: 'invalid'
  }));
