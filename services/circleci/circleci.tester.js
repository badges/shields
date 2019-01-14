'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isBuildStatus } = require('../../lib/build-status')

const t = (module.exports = new ServiceTester({
  id: 'circleci',
  title: 'Circle CI',
}))

t.create('circle ci (valid, without branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('circle ci (valid, with branch)')
  .get('/project/github/RedSparr0w/node-csgo-parser/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('build status with "github" as a default VCS')
  .get('/project/RedSparr0w/node-csgo-parser/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('circle ci (valid, with token)')
  .get(
    '/token/b90b5c49e59a4c67ba3a92f7992587ac7a0408c2/project/github/RedSparr0w/node-csgo-parser/master.json'
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('circle ci (not found)')
  .get('/project/github/PyvesB/EmptyRepo.json')
  .expectJSON({ name: 'build', value: 'project not found' })

t.create('circle ci (connection error)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' })

t.create('circle ci (no response data)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json')
  .intercept(nock =>
    nock('https://circleci.com')
      .get(
        '/api/v1.1/project/github/RedSparr0w/node-csgo-parser?filter=completed&limit=1'
      )
      .reply(200)
  )
  .expectJSON({ name: 'build', value: 'unparseable json response' })

// we're passing &limit=1 so we expect exactly one array element
t.create('circle ci (invalid json)')
  .get('/project/github/RedSparr0w/node-csgo-parser.json?style=_shields_test')
  .intercept(nock =>
    nock('https://circleci.com')
      .get(
        '/api/v1.1/project/github/RedSparr0w/node-csgo-parser?filter=completed&limit=1'
      )
      .reply(200, [{ status: 'success' }, { status: 'fixed' }])
  )
  .expectJSON({
    name: 'build',
    value: 'invalid response data',
    color: 'lightgray',
  })
