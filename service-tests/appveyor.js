'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'appveyor', title: 'AppVeyor' });
module.exports = t;

// Test AppVeyor build status badge
t.create('CI build status')
  .get('/ci/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'running', 'queued')
  }));

// Test AppVeyor branch build status badge
t.create('CI build status on master branch')
  .get('/ci/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'running', 'queued')
  }));

// Test AppVeyor build status badge on a non-existing project
t.create('CI 404')
.get('/ci/somerandomproject/thatdoesntexits.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.string().regex(/^project not found or access denied$/),
  }));

// Test AppVeyor tests status badge
t.create('tests status')
  .get('/tests/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tests'),
    value: Joi.string().regex(/^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/),
  }));

// Test AppVeyor branch tests status badge
t.create('tests status on master branch')
  .get('/tests/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tests'),
    value: Joi.string().regex(/^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/),
  }));

// Test AppVeyor tests status badge for a non-existing project
t.create('tests 404')
.get('/tests/somerandomproject/thatdoesntexits.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tests'),
    value: Joi.string().regex(/^project not found or access denied$/),
  }));

