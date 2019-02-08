'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../../lib/build-status')

const t = (module.exports = require('../tester').createServiceTester())

t.create('CI status')
  .timeout(10000)
  .get('/gruntjs/grunt.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status on branch')
  .timeout(10000)
  .get('/gruntjs/grunt/master.json')
  .expectJSONTypes(Joi.object().keys({ name: 'build', value: isBuildStatus }))

t.create('CI status on nonexistent project')
  .timeout(10000)
  .get('/somerandomproject/thatdoesntexist.json')
  .expectJSON({ name: 'build', value: 'project not found or access denied' })

t.create('CI status on project that does exist but has no builds yet')
  .get('/gruntjs/grunt.json?style=_shields_test')
  .intercept(nock =>
    nock('https://ci.appveyor.com/api/projects/')
      .get('/gruntjs/grunt')
      .reply(200, {})
  )
  .expectJSON({ name: 'build', value: 'no builds found', color: 'lightgrey' })
