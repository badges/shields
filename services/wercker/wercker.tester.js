'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const { isBuildStatus } = require('../test-validators')

const t = new ServiceTester({ id: 'wercker', title: 'Wercker' })
module.exports = t

t.create('CI build status')
  .get('/ci/wercker/go-wercker-api.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI build status (branch)')
  .get('/ci/wercker/go-wercker-api/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI build status (old v1 API)')
  .get('/ci/559e33c8e982fc615500b357.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI application not found')
  .get('/ci/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'build', value: 'application not found' })

t.create('CI private application')
  .get('/ci/wercker/blueprint.json')
  .expectJSON({ name: 'build', value: 'private application not supported' })
