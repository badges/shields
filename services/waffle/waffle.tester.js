'use strict'

const Joi = require('joi')
const { invalidJSON } = require('../response-fixtures')
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

t.create(
  'label should be `bug` & value should be exactly 5 as supplied in `fakeData`.  e.g: bug|5'
)
  .get('/userName/repoName/bug.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.waffle.io/')
      .get('/userName/repoName/columns?with=count')
      .reply(200, fakeData)
  )
  .expectBadge({
    label: 'bug',
    message: '5',
    color: '#fbca04',
  })

t.create('label should be `Mybug` & value should be formatted.  e.g: Mybug|25')
  .get('/ritwickdey/vscode-live-server/bug.json?label=Mybug')
  .expectBadge({
    label: 'Mybug',
    message: Joi.number()
      .integer()
      .positive(),
  })

t.create('label (repo not found)')
  .get('/not-a-user/not-a-repo/bug.json')
  .expectBadge({
    label: 'waffle',
    message: 'not found',
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

t.create('label (connection error)')
  .get('/ritwickdey/vscode-live-server/bug.json')
  .networkOff()
  .expectBadge({ label: 'waffle', message: 'inaccessible' })

t.create('label (unexpected response)')
  .get('/userName/repoName/bug.json')
  .intercept(nock =>
    nock('https://api.waffle.io/')
      .get('/userName/repoName/columns?with=count')
      .reply(invalidJSON)
  )
  .expectBadge({ label: 'waffle', message: 'invalid' })
