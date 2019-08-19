'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('nonexistent repo')
  .get('/badges/shields-fakeness/fake.json')
  .expectBadge({
    label: 'build',
    message: 'repo or workflow not found',
  })

t.create('nonexistent workflow')
  .get('/actions/toolkit/not-a-real-workflow.json')
  .expectBadge({
    label: 'build',
    message: 'repo or workflow not found',
  })

t.create('nonexistent workflow')
  .get('/actions/toolkit/Main%20workflow.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })
