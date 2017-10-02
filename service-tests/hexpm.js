'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'hexpm', title: 'Hex.pm' });
module.exports = t;

t.create('downloads per week')
  .get('/dw/cowboy.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\d+[a-z]?\/week$/)
  }));

t.create('downloads per day')
  .get('/dd/cowboy.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\d+[a-z]?\/day$/)
  }));

t.create('downloads in total')
  .get('/dt/cowboy.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('downloads'),
    value: Joi.string().regex(/^\d+[kMGTPEZY]?$/)
  }));

t.create('version')
  .get('/v/cowboy.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('hex'),
    value: Joi.string().regex(/^v\d+.\d+.?\d?$/)
  }));

t.create('license')
  .get('/l/cowboy.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('license'),
    value: Joi.string().required()
  }));

t.create('unknown repo')
  .get('/l/this-repo-does-not-exist.json')
  .expectJSON({ name: 'hex', value: 'invalid' });

t.create('connection error')
  .get('/l/cowboy.json')
  .networkOff()
  .expectJSON({ name: 'hex', value: 'inaccessible' });
