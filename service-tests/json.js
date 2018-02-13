'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const colorscheme = require('../lib/colorscheme.json');
const mapValues = require('lodash.mapvalues');

const colorsB = mapValues(colorscheme, 'colorB');

const t = new ServiceTester({ id: 'badge/dynamic/json', title: 'User Defined JSON Source Data' });
module.exports = t;

t.create('Connection error')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name&label=Package Name&style=_shields_test')
  .networkOff()
  .expectJSON({ name: 'Package Name', value: 'inaccessible', colorB: colorsB.lightgrey });

t.create('No URI specified')
  .get('.json?query=$.name&label=Package Name&style=_shields_test')
  .expectJSON({ name: 'Package Name', value: 'no uri specified', colorB: colorsB.red });

t.create('JSON from uri')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'gh-badges', colorB: colorsB.brightgreen });

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
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.does_not_exist&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no result', colorB: colorsB.lightgrey });

t.create('JSON from uri | invalid uri')
  .get('.json?uri=https://github.com/badges/shields/raw/master/notafile.json&query=$.version&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'invalid resource', colorB: colorsB.lightgrey });

t.create('JSON from uri | user color overrides default')
  .get('.json?uri=https://github.com/badges/shields/raw/master/package.json&query=$.name&colorB=10ADED&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'gh-badges', colorB: '#10ADED' });

t.create('JSON from uri | error color overrides default')
  .get('.json?uri=https://github.com/badges/shields/raw/master/notafile.json&query=$.version&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'invalid resource', colorB: colorsB.lightgrey });

t.create('JSON from uri | error color overrides user specified')
  .get('.json?query=$.version&colorB=10ADED&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no uri specified', colorB: colorsB.red });
