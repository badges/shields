'use strict'

const t = require('../create-service-tester')()
module.exports = t

t.create('github pull request check state')
  .get('/s/pulls/badges/shields/1110.json')
  .expectJSON({ name: 'checks', value: 'failure' })

t.create('github pull request check state (pull request not found)')
  .get('/s/pulls/badges/shields/5110.json')
  .expectJSON({ name: 'checks', value: 'pull request or repo not found' })

t.create('github pull request check contexts')
  .get('/contexts/pulls/badges/shields/1110.json')
  .expectJSON({ name: 'checks', value: '1 failure' })
