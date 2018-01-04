'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'codeclimate', title: 'Code Climate' })

t.create('maintainability score')
  .get('/maintainability/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'maintainability',
    value: Joi.equal('A', 'B', 'C', 'D', 'F')
  }));

t.create('maintainability score for non-existent repo')
  .get('/maintainability/unknown/unknown.json')
  .expectJSON({
    name: 'maintainability',
    value: 'not found'
  });

t.create('test coverage score')
  .get('/c/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'F')
  }));

t.create('test coverage score for non-existent repo')
  .get('/c/unknown/unknown.json')
  .expectJSON({
    name: 'coverage',
    value: 'not found'
  });

t.create('test coverage score for repo without test reports')
  .get('/c/kabisaict/flow.json')
  .expectJSON({
    name: 'coverage',
    value: 'unknown'
  });

module.exports = t;
