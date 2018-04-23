'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const t = new ServiceTester({ id: 'buildkite', title: 'Buildkite Builds' });
const { invalidJSON } = require('../response-fixtures');
module.exports = t;

t.create('buildkite invalid pipeline')
  .get('/unknown-identifier/unknown-branch.json')
  .expectJSON({ name: 'build', value: 'not found' });

t.create('buildkite valid pipeline')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('buildkite valid pipeline skipping branch')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('buildkite unknown branch')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/unknown-branch.json')
  .expectJSON({ name: 'build', value: 'unknown' });

t.create('buildkite connection error')
  .get('/_.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' });

t.create('buildkite unexpected response')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json')
  .intercept(nock => nock('https://badge.buildkite.com')
    .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json?branch=master')
    .reply(invalidJSON)
  )
  .expectJSON({name: 'build', value: 'invalid'});
