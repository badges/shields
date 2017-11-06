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

t.create('maintainability score for non-existent repo')
  .get('/maintainability/unknown/unknown.json')
  .expectJSON({
    name: 'maintainability',
    value: 'not found'
  });

t.create('maintainability score without content-disposition')
  .get('/maintainability/Nickersoft/dql.json')
  .intercept(nock => nock('https://api.codeclimate.com')
    .get('/v1/repos')
    .query({ github_slug: 'Nickersoft/dql' })
    .reply(200, { data: [{ attributes: { badge_token: '78ac0fa85c83fea5213a' } }] })
    .head('/v1/badges/78ac0fa85c83fea5213a/maintainability')
    .reply(200))
  .expectJSON({ name: 'maintainability', value: 'invalid' });

t.create('test coverage score')
  .get('/c/Nickersoft/dql.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: Joi.equal('A', 'B', 'C', 'D', 'F', 'unknown')
  }));

t.create('test coverage score for non-existent repo')
  .get('/c/unknown/unknown.json')
  .expectJSON({
    name: 'coverage',
    value: 'not found'
  });

t.create('test coverage score without content-disposition')
  .get('/c/Nickersoft/dql.json')
  .intercept(nock => nock('https://api.codeclimate.com')
    .get('/v1/repos')
    .query({ github_slug: 'Nickersoft/dql' })
    .reply(200, { data: [{ attributes: { badge_token: '78ac0fa85c83fea5213a' } }] })
    .head('/v1/badges/78ac0fa85c83fea5213a/test_coverage')
    .reply(200))
  .expectJSON({ name: 'coverage', value: 'invalid' });


module.exports = t;
