'use strict';

const Joi = require('joi');
const ServiceTester = require('./runner/service-tester');

const isDependencyStatus = Joi.string().valid('insecure', 'latest', 'recent', 'stale');

const t = new ServiceTester({ id: 'depfu', title: 'Depfu' });
module.exports = t;


t.create('depfu dependencies (valid)')
  .get('/depfu/example-ruby.json')
  .expectJSONTypes(Joi.object().keys({
    name: 'dependencies',
    value: isDependencyStatus
  }));

t.create('depfu dependencies (repo not found)')
  .get('/pyvesb/emptyrepo.json')
  .expectJSON({name: 'dependencies', value: 'invalid'});

t.create('depfu dependencies (connection error)')
  .get('/depfu/example-ruby.json')
  .networkOff()
  .expectJSON({name: 'dependencies', value: 'inaccessible'});
