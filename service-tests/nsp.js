'use strict'

const Joi = require('joi')
const ServiceTester = require('./runner/service-tester')

const t = new ServiceTester({id: 'nsp', title: 'Node Security Platform'})

t.create('get a package without vulnerabilities')
  .get('/npm/bronze.json')
  .expectJSONTypes(Joi.object().keys({name: 'nsp', value: 'no known vulnerabilities'}))

t.create('get a package with vulnerabilities')
  .get('/npm/nodeaaaaa.json')
  .expectJSONTypes(Joi.object().keys({name: 'nsp', value: `1 vulnerabilities`}))

t.create('get a package that does not exist')
  .get('/npm/some-unknown-package.json')
  .expectJSONTypes(Joi.object().keys({name: 'nsp', value: `not available`}))

module.exports = t
