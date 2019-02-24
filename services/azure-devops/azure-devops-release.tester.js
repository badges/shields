'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../../lib/build-status')
const t = (module.exports = require('../tester').createServiceTester())

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project
// solely created for Shields.io testing.

t.create('release status is succeeded')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'deployment',
      value: isBuildStatus,
    })
  )

t.create('unknown environment')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/515.json')
  .expectJSON({ name: 'deployment', value: 'user or environment not found' })

t.create('unknown definition')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/515/515.json')
  .expectJSON({
    name: 'deployment',
    value: 'inaccessible or definition not found',
  })

t.create('unknown project')
  .get('/totodem/515/515/515.json')
  .expectJSON({ name: 'deployment', value: 'project not found' })

t.create('unknown user')
  .get('/this-repo/does-not-exist/1/2.json')
  .expectJSON({ name: 'deployment', value: 'user or environment not found' })
