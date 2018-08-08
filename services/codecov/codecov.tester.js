'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const { isIntegerPercentage } = require('../test-validators');

const t = new ServiceTester({ id: 'codecov', title: 'Codecov.io' });
module.exports = t;

t.create('gets coverage status')
  .get('/c/github/codecov/example-python.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage,
  }));

t.create('gets coverate status for branch')
  .get('/c/github/codecov/example-python/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'coverage',
    value: isIntegerPercentage,
  }));
