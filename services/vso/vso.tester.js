'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const isValidStatus = Joi.equal('passing', 'failing')

const t = new ServiceTester({
  id: 'vso',
  title: 'Visual Studio Team Services',
})
module.exports = t

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project solely created for Shield.io testing

// Builds

t.create('build status on default branch')
  .get('/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isValidStatus,
    })
  )

t.create('build status on named branch')
  .get('/build/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isValidStatus,
    })
  )

t.create('build status on unknown repo')
  .get('/build/this-repo/does-not/exist.json')
  .expectJSON({ name: 'build', value: 'inaccessible' })

t.create('build status with connection error')
  .get('/build/foo/bar/foobar.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' })

// Releases

t.create('release status is succeeded')
  .get('/release/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/1/1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'deployment',
      value: isValidStatus,
    })
  )

t.create('release status on unknown repo')
  .get('/release/this-repo/does-not-exist/1/2.json')
  .expectJSON({ name: 'deployment', value: 'inaccessible' })

t.create('release status with connection error')
  .get('/release/foo/bar/1/2.json')
  .networkOff()
  .expectJSON({ name: 'deployment', value: 'inaccessible' })
