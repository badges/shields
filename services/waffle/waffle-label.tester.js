'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'Waffle',
  title: 'WaffleLabel',
  pathPrefix: '/waffle/label',
}))

t.create('no longer available')
  .get('/ritwickdey/vscode-live-server/bug.json')
  .expectBadge({
    label: 'waffle',
    message: 'no longer available',
  })
