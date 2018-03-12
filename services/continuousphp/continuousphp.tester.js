'use strict';

const Joi = require('joi');
const ServiceTester = require('../service-tester');

const t = new ServiceTester({ id: 'continuousphp', title: 'continuousphp' });
module.exports = t;

t.create('build status on default branch')
  .get('/git-hub/doctrine/dbal.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal('failing', 'passing', 'unknown', 'unstable')
  }));

t.create('build status on named branch')
  .get('/git-hub/doctrine/dbal/develop.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'build',
    value: Joi.equal('failing', 'passing', 'unknown')
  }));

t.create('unknown repo')
  .get('/git-hub/this-repo/does-not-exist.json')
  .expectJSON({ name: 'build', value: 'invalid' });

t.create('connection error')
  .get('/git-hub/doctrine/dbal.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'invalid' });
