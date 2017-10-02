'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'chrome-web-store', title: 'Chrome Web Store' });
module.exports = t;

t.create('Downloads (now users)')
  .get('/d/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('users'),
    value: Joi.string().regex(/^\d+k?$/)
  }));

t.create('Users')
  .get('/users/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('users'),
    value: Joi.string().regex(/^\d+k?$/)
  }));

t.create('Version')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('chrome web store'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('Version - Custom label')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json?label=IndieGala Helper')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('IndieGala Helper'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('Rating')
  .get('/rating/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().regex(/^\d\.?\d+?\/5$/)
  }));

t.create('Stars')
  .get('/stars/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().regex(/^[\u2605\u2606]{5}$/)
  }));

t.create('Invalid addon')
  .get('/d/invalid-name-of-addon.json')
  .expectJSON({ name: 'chrome web store', value: 'invalid' });

t.create('No connection')
  .get('/v/alhjnofcnnpeaphgeakdhkebafjcpeae.json')
  .networkOff()
  .expectJSON({ name: 'chrome web store', value: 'inaccessible' });
