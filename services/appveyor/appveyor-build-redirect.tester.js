import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'AppveyorBuildRedirect',
  title: 'AppveyorBuildRedirect',
  pathPrefix: '/appveyor/ci',
})

t.create('Appveyor CI')
  .get('/gruntjs/grunt')
  .expectRedirect('/appveyor/build/gruntjs/grunt.svg')

t.create('Appveyor CI (branch)')
  .get('/gruntjs/grunt/develop')
  .expectRedirect('/appveyor/build/gruntjs/grunt/develop.svg')
