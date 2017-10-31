'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'codeclimate', title: 'Code Climate' })

t.create('maintainability score')
  .get('/maintainability/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'maintainability',
    value: Joi.equal('A', 'B', 'C', 'D', 'F', 'unknown')
  }));

t.create('maintainability score for unknown repo')
  .get('/maintainability/unknown/unknown.json')
  .expectJSON({
    name: 'maintainability',
    value: 'unknown'
  });

t.create('test coverage score')
  .get('/tc/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'F', 'unknown')
  }));

t.create('test coverage score for unknown repo')
  .get('/tc/unknown/unknown.json')
  .expectJSON({
    name: 'coverage',
    value: 'unknown'
  });


module.exports = t;
