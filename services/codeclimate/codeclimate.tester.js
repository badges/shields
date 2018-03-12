'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');
const {
  isIntegerPercentage,
} = require('./helpers/validators');

const t = new ServiceTester({ id: 'codeclimate', title: 'Code Climate' })

// Tests based on Code Climate's test reports endpoint.
t.create('test coverage percentage')
  .get('/c/jekyll/jekyll.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage
  }));

t.create('test coverage percentage alternative coverage URL')
  .get('/coverage/jekyll/jekyll.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage
  }));

t.create('test coverage percentage alternative top-level URL')
  .get('/jekyll/jekyll.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage
  }));

t.create('test coverage letter')
  .get('/c-letter/jekyll/jekyll.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'E', 'F')
  }));

t.create('test coverage percentage for non-existent repo')
  .get('/c/unknown/unknown.json')
  .expectJSON({
    name: 'coverage',
    value: 'not found'
  });

t.create('test coverage percentage for repo without test reports')
  .get('/c/angular/angular.js.json')
  .expectJSON({
    name: 'coverage',
    value: 'unknown'
  });

// Tests based on Code Climate's snapshots endpoint.
t.create('issues count')
  .get('/issues/angular/angular.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'issues',
    value: Joi.number().integer().positive()
  }));

t.create('technical debt percentage')
  .get('/tech-debt/angular/angular.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'technical debt',
    value: isIntegerPercentage
  }));

t.create('maintainability percentage')
  .get('/maintainability-percentage/angular/angular.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'maintainability',
    value: isIntegerPercentage
  }));


t.create('maintainability letter')
  .get('/maintainability/angular/angular.js.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'maintainability',
    value: Joi.equal('A', 'B', 'C', 'D', 'E', 'F')
  }));

t.create('maintainability letter for non-existent repo')
  .get('/maintainability/unknown/unknown.json')
  .expectJSON({
    name: 'maintainability',
    value: 'not found'
  });

t.create('maintainability letter for repo without snapshots')
  .get('/maintainability/kabisaict/flow.json')
  .expectJSON({
    name: 'maintainability',
    value: 'unknown'
  });

module.exports = t;
