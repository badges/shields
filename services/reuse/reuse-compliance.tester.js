'use strict'

const t = (module.exports = require('../tester').createServiceTester())

t.create('valid repo -- compliant')
  .get('/github/fsfe/reuse-tool.json')
  .expectBadge({
    label: 'reuse',
    message: 'compliant',
    color: 'brightgreen',
  })

t.create('valid repo -- noncompliant')
  .get('/github/tapanchudasama/Google-Drive-UI.json')
  .expectBadge({
    label: 'reuse',
    message: 'non-compliant',
    color: 'red',
  })

t.create('invalid repo').get('/github/repo/invalid-repo.json').expectBadge({
  label: 'reuse',
  message: 'Not a Git repository',
})
