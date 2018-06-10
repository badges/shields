'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const {
  isIntegerPercentage,
} = require('../test-validators');

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

t.create('malformed response for outer user repos query')
  .get('/maintainability/angular/angular.js.json')
  .intercept(nock => nock('https://api.codeclimate.com')
    .get('/v1/repos?github_slug=angular/angular.js')
    .reply(200, {
      data: [{}] // No relationships in the list of data elements.
    }))
  .expectJSON({
    name: 'maintainability',
    value: 'invalid'
  });

t.create('malformed response for inner specific repo query')
  .get('/maintainability/angular/angular.js.json')
  .intercept(nock => nock('https://api.codeclimate.com', {allowUnmocked: true})
    .get(/\/v1\/repos\/[a-z0-9]+\/snapshots\/[a-z0-9]+/)
    .reply(200, {})) // No data.
  .networkOn() // Combined with allowUnmocked: true, this allows the outer user repos query to go through.
  .expectJSON({
    name: 'maintainability',
    value: 'invalid'
  });

module.exports = t;
