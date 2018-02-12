'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const colorscheme = require('../lib/colorscheme.json');
const mapValues = require('lodash.mapvalues');

const colorsB = mapValues(colorscheme, 'colorB');

const t = new ServiceTester({ id: 'badge/dynamic/xml', title: 'User Defined XML Source Data' });
module.exports = t;

t.create('Connection error')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/name&label=Package Name&style=_shields_test')
  .networkOff()
  .expectJSON({ name: 'Package Name', value: 'inaccessible', colorB: colorsB.lightgrey });

t.create('No URI specified')
  .get('.json?query=//name&label=Package Name&style=_shields_test')
  .expectJSON({ name: 'Package Name', value: 'no uri specified', colorB: colorsB.red });

t.create('XML from uri')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/name&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'IndieGala Helper', colorB: colorsB.brightgreen });

t.create('XML from uri | caching with new query params')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/addon/version')
  .expectJSONTypes(Joi.object().keys({
    name: 'custom badge',
    value: Joi.string().regex(/^\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('XML from uri | with prefix & suffix & label')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=//version&prefix=v&suffix= dev&label=Shields')
  .expectJSONTypes(Joi.object().keys({
    name: 'Shields',
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sdev$/)
  }));

t.create('XML from uri | object doesnt exist')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=/does/not/exist&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no result', colorB: colorsB.lightgrey });

t.create('XML from uri | invalid uri')
  .get('.json?uri=https://github.com/badges/shields/raw/master/notafile.xml&query=//version&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'invalid resource', colorB: colorsB.lightgrey });

t.create('XML from uri | user color overrides default')
  .get('.json?uri=https://services.addons.mozilla.org/en-US/firefox/api/1.5/addon/707078&query=//name&colorB=10ADED&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'IndieGala Helper', colorB: '#10ADED' });

t.create('XML from uri | error color overrides default')
  .get('.json?uri=https://github.com/badges/shields/raw/master/notafile.xml&query=//version&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'invalid resource', colorB: colorsB.lightgrey });

t.create('XML from uri | error color overrides user specified')
  .get('.json?query=//version&colorB=10ADED&style=_shields_test')
  .expectJSON({ name: 'custom badge', value: 'no uri specified', colorB: colorsB.red });
