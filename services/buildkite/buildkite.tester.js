'use strict';

const ServiceTester = require('../service-tester');
const t = new ServiceTester({ id: 'buildkite', title: 'Buildkite Builds' });
module.exports = t;

t.create('buildkite invalid pipeline')
  .get('/unknown-identifier/unknown-branch.json')
  .expectJSON({ name: 'buildkite', value: 'invalid' });

t.create('buildkite valid pipeline')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.json')
  .expectJSON({ name: 'buildkite', value: 'Passing' });
