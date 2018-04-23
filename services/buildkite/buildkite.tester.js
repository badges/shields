'use strict';

const ServiceTester = require('../service-tester');
const t = new ServiceTester({ id: 'buildkite', title: 'Buildkite Builds' });
module.exports = t;

t.create('buildkite invalid pipeline')
  .get('/unknown-identifier/unknown-branch.json')
  .expectJSON({ name: 'build', value: 'not found' });

t.create('buildkite valid pipeline')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.json')
  .expectJSON({ name: 'build', value: 'passing' });

t.create('buildkite valid pipeline skipping branch')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json')
  .expectJSON({ name: 'build', value: 'passing' });

t.create('buildkite unknown branch')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/unknown-branch.json')
  .expectJSON({ name: 'build', value: 'unknown' });

t.create('buildkite connection error')
  .get('/_.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' });
