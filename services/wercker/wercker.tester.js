'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const { isBuildStatus } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('CI build status')
  .get('/wercker/go-wercker-api.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI build status (branch)')
  .get('/wercker/go-wercker-api/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI build status (old v1 API)')
  .get('/559e33c8e982fc615500b357.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI application not found')
  .get('/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'build', value: 'application not found' })

t.create('CI private application')
  .get('/wercker/blueprint.json')
  .expectJSON({ name: 'build', value: 'private application not supported' })
