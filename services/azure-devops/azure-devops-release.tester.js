'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../../lib/build-status')

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project
// solely created for Shields.io testing.

const t = (module.exports = require('../create-service-tester')())

t.create('release status is succeeded')
  .get(
    '/azure-devops/release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'deployment',
      value: isBuildStatus,
    })
  )

t.create('unknown environment')
  .get(
    '/azure-devops/release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/515.json'
  )
  .expectJSON({ name: 'deployment', value: 'user or environment not found' })

t.create('unknown definition')
  .get(
    '/azure-devops/release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/515/515.json'
  )
  .expectJSON({
    name: 'deployment',
    value: 'inaccessible or definition not found',
  })

t.create('unknown project')
  .get('/azure-devops/release/totodem/515/515/515.json')
  .expectJSON({ name: 'deployment', value: 'project not found' })

t.create('unknown user')
  .get('/azure-devops/release/this-repo/does-not-exist/1/2.json')
  .expectJSON({ name: 'deployment', value: 'user or environment not found' })
