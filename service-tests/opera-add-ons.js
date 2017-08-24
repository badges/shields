'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({id: 'opera-add-ons', title: 'Opera add-ons'});
module.exports = t;

// 200

t.create('version').get('/v/adblockforopera.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('opera add-ons'),
    value: Joi.string().regex(/^v\d+(\.\d+){1,2}$/)
  }));

t.create('downloads').get('/d/adblockforopera.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\d+[kMGTPEZ]? total$/)
  }));

t.create('rating').get('/rating/adblockforopera.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().regex(/^\d+(\.\d{1,2})?\/5$/)
  }));

t.create('stars').get('/stars/adblockforopera.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().regex(/^★*☆*$/).length(5)
  }));

t.create('rating count').get('/rating-count/adblockforopera.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating count'),
    value: Joi.string().regex(/^\d+[kMGTPEZ]? total$/)
  }));

// 404

t.create('version 404').get('/v/iamnothere.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('opera add-ons'),
    value: Joi.string().equal('invalid')
  }));

t.create('downloads 404').get('/d/iamnothere.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().equal('invalid')
  }));

t.create('rating 404').get('/rating/iamnothere.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().equal('invalid')
  }));

t.create('stars 404').get('/stars/iamnothere.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating'),
    value: Joi.string().equal('invalid')
  }));

t.create('rating count 404').get('/rating-count/iamnothere.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('rating count'),
    value: Joi.string().equal('invalid')
  }));
