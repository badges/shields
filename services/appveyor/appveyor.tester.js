'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const { isBuildStatus } = require('../test-validators');
const isAppveyorTestTotals =
  Joi.string().regex(/^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/);

const t = new ServiceTester({ id: 'appveyor', title: 'AppVeyor' });
module.exports = t;

// Test AppVeyor build status badge
t.create('CI build status')
  .get('/ci/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }));

// Test AppVeyor branch build status badge
t.create('CI build status on master branch')
  .get('/ci/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }));

// Test AppVeyor build status badge on a non-existing project
t.create('CI 404')
.get('/ci/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'build', value: 'project not found or access denied' });

t.create('CI (connection error)')
  .get('/ci/this-one/is-not-real-either.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' });

// Test AppVeyor tests status badge
t.create('tests status')
  .get('/tests/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals }));

// Test AppVeyor branch tests status badge
t.create('tests status on master branch')
  .get('/tests/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals }));

// Test AppVeyor tests status badge for a non-existing project
t.create('tests 404')
  .get('/tests/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'tests', value: 'project not found or access denied' });
