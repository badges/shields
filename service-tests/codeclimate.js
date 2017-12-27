'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isPercentage,
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'codeclimate', title: 'Code Climate' })

// Tests based on Code Climate's test reports endpoint.
t.create('test coverage score')
  .get('/coverage/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'E', 'F')
  }));

t.create('test coverage score alternative URL')
  .get('/c/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'E', 'F')
  }));

t.create('test coverage score alternative top-level URL')
  .get('/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'E', 'F')
  }));

t.create('test coverage percentage')
  .get('/coverage-percentage/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isPercentage
  }));

t.create('test coverage score for non-existent repo')
  .get('/coverage/unknown/unknown.json')
  .expectJSON({
    name: 'coverage',
    value: 'not found'
  });

t.create('test coverage score for repo without test reports')
  .get('/coverage/kabisaict/flow.json')
  .expectJSON({
    name: 'coverage',
    value: 'unknown'
  });

// Tests based on Code Climate's snapshots endpoint.
t.create('issues count')
  .get('/issues/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issues',
    value: Joi.number().integer().positive()
  }));

t.create('maintainability score')
  .get('/maintainability/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'maintainability',
    value: Joi.equal('A', 'B', 'C', 'D', 'E', 'F')
  }));

t.create('maintainability percentage')
  .get('/maintainability-percentage/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'maintainability',
    value: isPercentage
  }));

t.create('maintainability score for non-existent repo')
  .get('/maintainability/unknown/unknown.json')
  .expectJSON({
    name: 'maintainability',
    value: 'not found'
  });

t.create('maintainability score for repo without snapshots')
  .get('/maintainability/kabisaict/flow.json')
  .expectJSON({
    name: 'maintainability',
    value: 'unknown'
  });

module.exports = t;
