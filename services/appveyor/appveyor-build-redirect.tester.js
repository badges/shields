'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'AppveyorBuildRedirect',
  title: 'AppveyorBuildRedirect',
  pathPrefix: '/appveyor/ci',
}))

t.create('Appveyor CI')
  .get('/gruntjs/grunt', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/appveyor/build/gruntjs/grunt.svg')

t.create('Appveyor CI (branch)')
  .get('/gruntjs/grunt/develop', {
    followRedirect: false,
  })
  .expectStatus(301)
  .expectHeader('Location', '/appveyor/build/gruntjs/grunt/develop.svg')
