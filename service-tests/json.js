'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'json', title: 'User Defined JSON Source Data' });
module.exports = t;

t.create('Connection error')
  .get('/Package Name/name/https://github.com/badges/shields/raw/master/package.json.json')
  .networkOff()
  .expectJSON({ name: 'Package Name', value: 'inaccessible' });
  
t.create('JSON from url')
  .get('/Package Name/name/https://github.com/badges/shields/raw/master/package.json.json')
  .expectJSON({ name: 'Package Name', value: 'gh-badges'});
  
t.create('JSON from url w/prefix & suffix')
  .get('/Shields-blue-v- dev/version/https://github.com/badges/shields/raw/master/package.json.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('Shields'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sdev$/)
  }));
  