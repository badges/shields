'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const isAppveyorBuildState = Joi.equal('failing', 'passing', 'running', 'queued');
const isAppveyorTestTotals =
  Joi.string().regex(/^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/);
const isCustomAppveyorTestTotals =
  Joi.string().regex(/^(?:[0-9]* ?(?:good|bad|n\/a) ?[0-9]*(?:,? )?)+$/);
const isEmojiAppveyorTestTotals =
  Joi.string().regex(/^(?:[0-9]* ?(?:✔|✘|●) ?[0-9]*(?:, | \| )?)+$/);

const t = new ServiceTester({ id: 'appveyor', title: 'AppVeyor' });
module.exports = t;

// Test AppVeyor build status badge
t.create('CI build status')
  .get('/ci/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isAppveyorBuildState }));

// Test AppVeyor branch build status badge
t.create('CI build status on master branch')
  .get('/ci/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isAppveyorBuildState }));

// Test AppVeyor build status badge on a non-existing project
t.create('CI 404')
.get('/ci/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'build', value: 'project not found or access denied' });

// Test AppVeyor tests status badge
t.create('tests status')
  .get('/tests/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals }));

// Test AppVeyor branch tests status badge
t.create('tests status on master branch')
  .get('/tests/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'tests', value: isAppveyorTestTotals }));

// Test AppVeyor tests status badge with custom label
t.create('tests status with custom labels')
.get('/tests/NZSmartie/coap-net-iu0to.json?passed=good&failed=bad&skipped=n/a')
.expectJSONTypes(Joi.object().keys({ name: 'tests', value: isCustomAppveyorTestTotals }));

// Test AppVeyor tests status badge with emoji
t.create('tests status with emoji labels')
.get('/tests/NZSmartie/coap-net-iu0to.json?passed=%E2%9C%94&failed=%E2%9C%98&skipped=%E2%97%8F')
.expectJSONTypes(Joi.object().keys({ name: 'tests', value: isEmojiAppveyorTestTotals }));

// Test AppVeyor tests status badge with compact value
t.create('tests status with compact value')
.get('/tests/NZSmartie/coap-net-iu0to.json?compactValue')
.expectJSONTypes(Joi.object().keys({ name: 'tests', value: isEmojiAppveyorTestTotals }));

// Test AppVeyor tests status badge for a non-existing project
t.create('tests 404')
  .get('/tests/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'tests', value: 'project not found or access denied' });
