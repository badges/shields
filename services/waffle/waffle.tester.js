'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { invalidJSON } = require('../response-fixtures')

const t = new ServiceTester({ id: 'waffle', title: 'Waffle.io' })
module.exports = t

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
  .get('/label/userName/repoName/bug.json?style=_shields_test')
  .intercept(nock =>
    nock('https://api.waffle.io/')
      .get('/userName/repoName/columns?with=count')
      .reply(200, fakeData)
  )
  .expectJSON({
    name: 'bug',
    value: '5',
    colorB: '#fbca04',
  })

t.create('label should be `Mybug` & value should be formated.  e.g: Mybug|25')
  .get('/label/ritwickdey/vscode-live-server/bug.json?label=Mybug')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'Mybug',
      value: Joi.number()
        .integer()
        .positive(),
    })
  )

t.create('label (repo not found)')
  .get('/label/not-a-user/not-a-repo/bug.json')
  .expectJSON({
    name: 'waffle',
    value: 'not found',
  })

t.create('label (label not found)')
  .get(
    '/label/ritwickdey/vscode-live-server/not-a-real-label.json?style=_shields_test'
  )
  .expectJSON({
    name: 'not-a-real-label',
    value: '0',
    colorB: '#78bdf2',
  })

t.create('label (empty response)')
  .get('/label/userName/repoName/bug.json')
  .intercept(nock =>
    nock('https://api.waffle.io/')
      .get('/userName/repoName/columns?with=count')
      .reply(200, [])
  )
  .expectJSON({
    name: 'waffle',
    value: 'absent',
  })

t.create('label (connection error)')
  .get('/label/ritwickdey/vscode-live-server/bug.json')
  .networkOff()
  .expectJSON({ name: 'waffle', value: 'inaccessible' })

t.create('label (unexpected response)')
  .get('/label/userName/repoName/bug.json')
  .intercept(nock =>
    nock('https://api.waffle.io/')
      .get('/userName/repoName/columns?with=count')
      .reply(invalidJSON)
  )
  .expectJSON({ name: 'waffle', value: 'invalid' })
