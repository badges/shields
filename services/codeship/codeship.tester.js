'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { isBuildStatus } = require('../../lib/build-status')

const t = (module.exports = new ServiceTester({
  id: 'codeship',
  title: 'codeship',
}))

t.create('codeship (valid, no branch)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('codeship (valid, with branch)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/master.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'build',
      value: isBuildStatus,
    })
  )

t.create('codeship (repo not found)')
  .get('/not-a-repo.json')
  .expectJSON({ name: 'build', value: 'not found' })

t.create('codeship (branch not found)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/not-a-branch.json')
  .expectJSON({ name: 'build', value: 'branch not found' })

t.create('codeship (connection error)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .networkOff()
  .expectJSON({ name: 'build', value: 'inaccessible' })

t.create('codeship (unexpected response header)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .intercept(nock =>
    nock('https://codeship.com')
      .get('/projects/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/status')
      .reply(200, '', {
        'content-disposition': 'foo',
      })
  )
  .expectJSON({ name: 'build', value: 'unknown' })

t.create('codeship (unexpected response body)')
  .get('/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1.json')
  .intercept(nock =>
    nock('https://codeship.com')
      .get('/projects/d6c1ddd0-16a3-0132-5f85-2e35c05e22b1/status')
      .reply(200, '')
  )
  .expectJSON({ name: 'build', value: 'invalid' })
