'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isDependencyState } = require('../test-validators')

const t = new ServiceTester({ id: 'librariesio', title: 'Libraries.io' })
module.exports = t

t.create('dependencies for releases')
  .get('/release/hex/phoenix/1.0.3.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependencies',
      value: isDependencyState,
    })
  )

t.create('dependencies for github')
  .get('/github/pyvesb/notepad4e.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'dependencies',
      value: isDependencyState,
    })
  )

t.create('release not found')
  .get('/release/hex/invalid/4.0.4.json')
  .expectJSON({
    name: 'dependencies',
    value: 'not available',
  })

t.create('no response data')
  .get('/github/phoenixframework/phoenix.json')
  .intercept(nock =>
    nock('https://libraries.io')
      .get('/api/github/phoenixframework/phoenix/dependencies')
      .reply(200)
  )
  .expectJSON({
    name: 'dependencies',
    value: 'invalid',
  })
