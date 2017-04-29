'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const t = new ServiceTester({ id: 'maven-central', title: 'Maven Central' })
module.exports = t;

t.create('latest version')
  .get('/v/com.github.fabriziocucci/yacl4j.json')
  .expectJSONTypes(Joi.object().keys({
    name: Joi.equal('maven-central'),
    value: Joi.string().regex(/^v(.*)$/)
}));

t.create('inexistent artifact')
  .get('/v/inexistent-group-id/inexistent-artifact-id.json')
  .expectJSON({ name: 'maven-central', value: 'invalid' });

t.create('connection error')
  .get('/v/com.github.fabriziocucci/yacl4j.json')
  .networkOff()
  .expectJSON({ name: 'maven-central', value: 'inaccessible' });