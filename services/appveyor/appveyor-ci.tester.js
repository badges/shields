'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const { isBuildStatus } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('CI status')
  .get('/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status on branch')
  .get('/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status on nonexistent project')
  .get('/somerandomproject/thatdoesntexist.json')
  .expectJSON({ name: 'build', value: 'project not found or access denied' })
