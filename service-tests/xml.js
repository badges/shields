'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'xml', title: 'User defined XML source data' });
module.exports = t;

t.create('Connection error')
  .get('/Extension Name/$.addon.name/https://services.addons.mozilla.org/api/1.5/addon/indiegala-helper.json')
  .networkOff()
  .expectJSON({ name: 'Extension Name', value: 'inaccessible' });

t.create('XML from url')
  .get('/Extension Name/$.addon.name/https://services.addons.mozilla.org/api/1.5/addon/indiegala-helper.json')
  .expectJSON({ name: 'Extension Name', value: 'IndieGala Helper'});

t.create('XML from url | w/prefix & suffix')
  .get('/IndieGala Helper-3498db-v- Final/$.addon.version/https://services.addons.mozilla.org/api/1.5/addon/indiegala-helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('IndieGala Helper'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?\sFinal$/)
  }));

t.create('XML from url | object doesnt exist')
  .get('/IndieGala Helper-3498db-v- Final/$.this.doesnt.exist/https://services.addons.mozilla.org/api/1.5/addon/indiegala-helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('IndieGala Helper'),
    value: Joi.equal('v Final')
  }));

t.create('XML from url | invalid address')
  .get('/IndieGala Helper-3498db-v- Final/$.addon.version/https://services.addons.mozilla.org/api/1.5/addon/indiegala-helpers.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('IndieGala Helper'),
    value: Joi.equal('invalid server')
  }));
