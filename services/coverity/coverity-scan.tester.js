'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())

t.create('live: known project id')
  .get('/3997.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'coverity',
      value: Joi.string().regex(/passing|passed .* new defects|pending|failed/),
    })
  )

t.create('live: unknown project id')
  .get('/abc.json')
  // Coverity actually returns an HTTP 200 status with an HTML page when the project is not found.
  .expectJSON({ name: 'coverity', value: 'unparseable json response' })

t.create('404 response')
  .get('/1.json')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/1')
      .get('/badge.json')
      .reply(404)
  )
  .expectJSON({ name: 'coverity', value: 'project not found' })

t.create('passed')
  .get('/2.json?style=_shields_test')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2')
      .get('/badge.json')
      .reply(200, {
        message: 'passed',
      })
  )
  .expectJSON({
    name: 'coverity',
    value: 'passing',
    color: 'brightgreen',
  })

t.create('passed with defects')
  .get('/2.json?style=_shields_test')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2')
      .get('/badge.json')
      .reply(200, {
        message: 'passed 51 new defects',
      })
  )
  .expectJSON({
    name: 'coverity',
    value: 'passed 51 new defects',
    color: 'yellow',
  })

t.create('pending')
  .get('/2.json?style=_shields_test')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2')
      .get('/badge.json')
      .reply(200, {
        message: 'pending',
      })
  )
  .expectJSON({
    name: 'coverity',
    value: 'pending',
    color: 'orange',
  })

t.create('failed')
  .get('/2.json?style=_shields_test')
  .intercept(nock =>
    nock('https://scan.coverity.com/projects/2')
      .get('/badge.json')
      .reply(200, {
        message: 'failed',
      })
  )
  .expectJSON({
    name: 'coverity',
    value: 'failed',
    color: 'red',
  })
