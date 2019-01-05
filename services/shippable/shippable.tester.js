'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('build status (valid, without branch)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('build status (valid, with branch)')
  .get('/5444c5ecb904a4b21567b0ff/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('build status (branch not found)')
  .get('/5444c5ecb904a4b21567b0ff/not-a-branch.json')
  .expectJSON({ name: 'shippable', value: 'branch not found' })

t.create('build status (not found)')
  .get('/not-a-build.json')
  .expectJSON({ name: 'shippable', value: 'not found' })

t.create('build status (unexpected status code)')
  .get('/5444c5ecb904a4b21567b0ff.json')
  .intercept(nock =>
    nock('https://api.shippable.com/')
      .get('/projects/5444c5ecb904a4b21567b0ff/branchRunStatus')
      .reply(200, '[{ "branchName": "master", "statusCode": 63 }]')
  )
  .expectJSON({ name: 'shippable', value: 'invalid response data' })
