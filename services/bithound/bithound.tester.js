'use strict'

const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'bithound',
  title: 'BitHound',
}))

t.create('no longer available (code)')
  .get('/code/github/rexxars/sse-channel.json')
  .expectBadge({
    label: 'bithound',
    message: 'no longer available',
  })

t.create('no longer available (dependencies)')
  .get('/dependencies/github/rexxars/sse-channel.json')
  .expectBadge({
    label: 'bithound',
    message: 'no longer available',
  })

t.create('no longer available (devDpendencies)')
  .get('/devDependencies/github/rexxars/sse-channel.json')
  .expectBadge({
    label: 'bithound',
    message: 'no longer available',
  })
