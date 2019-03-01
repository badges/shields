'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

// https://dev.azure.com/totodem/Shields.io is a public Azure DevOps project
// solely created for Shields.io testing.

t.create('default branch')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('named branch')
  .get('/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/2/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('unknown definition')
  .get('/larsbrinkhoff/953a34b9-5966-4923-a48a-c41874cfb5f5/515.json')
  .expectBadge({ label: 'build', message: 'definition not found' })

t.create('unknown project')
  .get('/larsbrinkhoff/foo/515.json')
  .expectBadge({ label: 'build', message: 'user or project not found' })

t.create('unknown user')
  .get('/notarealuser/foo/515.json')
  .expectBadge({ label: 'build', message: 'user or project not found' })

// The following build definition has always a partially succeeded status
t.create('partially succeeded build')
  .get(
    '/totodem/8cf3ec0e-d0c2-4fcd-8206-ad204f254a96/4.json?style=_shields_test'
  )
  .expectBadge({ label: 'build', message: 'passing', color: 'orange' })
