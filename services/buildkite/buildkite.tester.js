'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');
const isBuildStatus = Joi.string().regex(/^(passing|failing|unknown)$/);

const t = new ServiceTester({ id: 'buildkite', title: 'Buildite Builds' });
module.exports = t;

// automated build endpoint

t.create('buildkite branch build (valid, branch)')
  .get('/_/branch/_.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'Buildkite',
    value: isBuildStatus
  }));

t.create('buildkite branch build with label (valid, branch, label)')
  .get('/_/branch/_/label/custom%20label.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'custom label',
    value: isBuildStatus
  }));
