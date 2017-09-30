'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'appveyor', title: 'AppVeyor' });
module.exports = t;

t.create('CI build status')
  .get('/ci/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'running', 'queued')
  }));

t.create('CI build status on master branch')
  .get('/ci/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.equal('failing', 'passing', 'running', 'queued')
  }));

t.create('CI 404')
.get('/ci/somerandomproject/thatdoesntexits.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('build'),
    value: Joi.string().regex(/^project not found or access denied$/),
  }));

t.create('tests status')
  .get('/tests/NZSmartie/coap-net-iu0to.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tests'),
    value: Joi.string().regex(/^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/),
  }));

  t.create('tests status on master branch')
  .get('/tests/NZSmartie/coap-net-iu0to/master.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tests'),
    value: Joi.string().regex(/^(?:[0-9]+ (?:passed|skipped|failed)(?:, )?)+$/),
  }));

t.create('CI 404')
.get('/tests/somerandomproject/thatdoesntexits.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('tests'),
    value: Joi.string().regex(/^project not found or access denied$/),
  }));

