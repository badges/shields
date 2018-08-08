'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isMetric,
  isStarRating,
  isVPlusDottedVersionAtLeastOne,
} = require('../test-validators');

const t = new ServiceTester({ id: 'amo', title: 'Mozilla Addons' });
module.exports = t;

t.create('Downloads')
  .get('/d/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({ name: 'downloads', value: isMetric }));

t.create('Version')
  .get('/v/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'mozilla add-on',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('Version - Custom label')
  .get('/v/IndieGala-Helper.json?label=IndieGala Helper')
  .expectJSONTypes(Joi.object().keys({
    name: 'IndieGala Helper',
    value: isVPlusDottedVersionAtLeastOne
  }));

t.create('Users')
  .get('/users/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'users',
    value: Joi.string().regex(/^\d+$/)
  }));

t.create('Rating')
  .get('/rating/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'rating',
    value: Joi.string().regex(/^\d\/\d$/)
  }));

t.create('Stars')
  .get('/stars/IndieGala-Helper.json')
  .expectJSONTypes(Joi.object().keys({ name: 'stars', value: isStarRating }));

t.create('Invalid addon')
  .get('/d/invalid-name-of-addon.json')
  .expectJSON({ name: 'mozilla add-on', value: 'invalid' });

t.create('No connection')
  .get('/v/IndieGala-Helper.json')
  .networkOff()
  .expectJSON({ name: 'mozilla add-on', value: 'inaccessible' });
