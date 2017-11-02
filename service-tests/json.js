'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'badge/dynamic/json', title: 'User Defined JSON Source Data' });
module.exports = t;

t.create('Connection error')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name&label=Package Name')
  .networkOff()
  .expectJSON({ name: 'Package Name', value: 'inaccessible' });

t.create('No URI specified')
  .get('.json?query=$.name&label=Package Name')
  .expectJSON({ name: 'Package Name', value: 'no uri specified' });

t.create('JSON from uri')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name')
  .expectJSON({ name: 'custom badge', value: 'gh-badges'});

t.create('JSON from uri | caching with new query params')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.version')
  .expectJSONTypes(Joi.object().keys({
    name: 'custom badge',
    value: Joi.string().regex(/^\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('JSON from uri | with prefix & suffix & label')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.version&prefix=v&suffix= dev&label=Shields')
  .expectJSONTypes(Joi.object().keys({
    name: 'Shields',
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sdev$/)
  }));

t.create('JSON from uri | object doesnt exist')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.does_not_exist')
  .expectJSON({ name: 'custom badge', value: '' });

t.create('JSON from uri | invalid uri')
  .get('.json?uri=https://github.com/badges/shields/raw/master/notafile.json&query=$.version')
  .expectJSON({ name: 'custom badge', value: 'invalid resource' });
