'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

const fakeData = [
  {
    label: null,
    count: 20,
  },
  {
    count: 10,
  },
  {
    label: {
      color: 'c5def5',
      name: 'feature',
    },
    count: 3,
  },
  {
    label: {
      name: 'bug',
      color: 'fbca04',
    },
    count: 5,
  },
]

t.create('label (repo not found)')
  .get('/not-a-user/not-a-repo/bug.json')
  .expectBadge({
    label: 'waffle',
    message: 'project not found',
  })

t.create('label (label not found)')
  .get(
    '/ritwickdey/vscode-live-server/not-a-real-label.json?style=_shields_test'
  )
  .expectBadge({
    label: 'not-a-real-label',
    message: '0',
    color: '#78bdf2',
  })

t.create('label (empty response)')
  .get('/userName/repoName/bug.json')
  .intercept(nock =>
    nock('https://api.waffle.io/')
      .get('/userName/repoName/columns?with=count')
      .reply(200, [])
  )
  .expectBadge({
    label: 'waffle',
    message: 'absent',
  })
