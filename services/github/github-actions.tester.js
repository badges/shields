'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())

t.create('valid repo and ref')
  .get('/actions/setup-node/master.json')
  .expectBadge({
    label: 'workflow',
    message: isBuildStatus,
  })

t.create('valid repo and invalid ref')
  .get('/actions/setup-node/not-a-real-branch-or-tag-or-commit.json')
  .expectBadge({
    label: 'workflow',
    message: 'repo or ref not found',
  })

t.create('invalid repo')
  .get('/actions/setup-node123abcdef456/master.json')
  .expectBadge({
    label: 'workflow',
    message: 'repo or ref not found',
  })

t.create('no check suites')
  .get('/badges/ServerScript/master.json')
  .expectBadge({
    label: 'workflow',
    message: 'no GitHub Actions found',
  })

t.create('no GitHub Actions')
  .get('/badges/shields/master.json')
  .expectBadge({
    label: 'workflow',
    message: 'no GitHub Actions found',
  })
