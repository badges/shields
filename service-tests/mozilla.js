'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'amo', title: 'Mozilla Addons' });
module.exports = t;

t.create('Downloads')
  .get('/d/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\d+k$/)
  }));

t.create('Version')
  .get('/v/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('mozilla add-on'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('Version - Custom label')
  .get('/v/IndieGala-Helper.json?label=IndieGala Helper')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('IndieGala Helper'),
    value: Joi.string().regex(/^v\d+(\.\d+)?(\.\d+)?$/)
  }));

t.create('Users')
  .get('/users/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('users'),
    value: Joi.string().regex(/^\d+$/)
  }));

t.create('Rating')
  .get('/rating/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().regex(/^\d\/\d$/)
  }));

t.create('Stars')
  .get('/stars/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().regex(/^[\u2605\u2606]{5}$/)
  }));

t.create('Invalid addon')
  .get('/d/invalid-name-of-addon.json')
  .expectJSON({ name: 'mozilla add-on', value: 'invalid' });

t.create('No connection')
  .get('/v/IndieGala-Helper.json')
  .networkOff()
  .expectJSON({ name: 'mozilla add-on', value: 'inaccessible' });
