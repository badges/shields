'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')

const { isBuildStatus } = require('../test-validators')

const t = createServiceTester()
module.exports = t

// Test AppVeyor build status badge
t.create('CI build status')
  .get('/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

// Test AppVeyor branch build status badge
t.create('CI build status on master branch')
  .get('/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

// Test AppVeyor build status badge on a non-existing project
t.create('CI 404')
  .get('/somerandomproject/thatdoesntexits.json')
  .expectJSON({ name: 'build', value: 'project not found or access denied' })

t.create('CI (connection error)')
  .get('/this-one/is-not-real-either.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' })
