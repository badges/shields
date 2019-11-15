'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('nonexistent repo')
  .get('/badges/shields-fakeness/fake.json')
  .expectBadge({
    label: 'build',
    message: 'repo, branch, or workflow not found',
  })

t.create('nonexistent workflow')
  .get('/actions/toolkit/not-a-real-workflow.json')
  .expectBadge({
    label: 'build',
    message: 'repo, branch, or workflow not found',
  })

t.create('valid workflow')
  .get('/actions/toolkit/Main%20workflow.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('valid workflow (branch)')
  .get('/actions/toolkit/Main%20workflow/master.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })
