'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { nonNegativeInteger } = require('../validators')

t.create('project not found)')
  .get('/not-a-user/not-a-repo/bug.json')
  .expectBadge({
    label: 'waffle',
    message: 'project not found',
  })

t.create('label not found')
  .get(
    '/ritwickdey/vscode-live-server/not-a-real-label.json?style=_shields_test'
  )
  .expectBadge({
    label: 'not-a-real-label',
    message: '0',
    color: '#78bdf2',
  })

t.create('specified label found')
  .get('/ritwickdey/vscode-live-server/bug.json')
  .expectBadge({
    label: 'bug',
    message: nonNegativeInteger,
  })
