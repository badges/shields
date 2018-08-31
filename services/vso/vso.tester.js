'use strict'

const Joi = require('joi')
const createServiceTester = require('../create-service-tester')
const { isBuildStatus } = require('../test-validators')

const t = createServiceTester()
module.exports = t

t.create('build status')
  .get('/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('unknown user')
  .get('/notarealuser/foo/515.json')
  .expectJSON({ name: 'build', value: 'user or build not found' })

t.create('unknown project')
  .get('/larsbrinkhoff/foo/515.json')
  .expectJSON({ name: 'build', value: 'project not found' })

t.create('unknown build')
  .get('/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/515.json')
  .expectJSON({ name: 'build', value: 'user or build not found' })
