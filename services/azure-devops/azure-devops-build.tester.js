'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../test-validators')

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project
// solely created for Shields.io testing.

const t = (module.exports = require('../create-service-tester')())

t.create('default branch')
  .get(
    '/azure-devops/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('named branch')
  .get(
    '/azure-devops/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2/master.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('unknown definition')
  .get(
    '/azure-devops/build/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/515.json'
  )
  .expectJSON({ name: 'build', value: 'definition not found' })

t.create('unknown project')
  .get('/azure-devops/build/larsbrinkhoff/foo/515.json')
  .expectJSON({ name: 'build', value: 'user or project not found' })

t.create('unknown user')
  .get('/azure-devops/build/notarealuser/foo/515.json')
  .expectJSON({ name: 'build', value: 'user or project not found' })
