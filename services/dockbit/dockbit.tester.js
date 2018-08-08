'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'dockbit', title: 'Dockbit' })
module.exports = t

t.create('deploy status')
  .get('/DockbitStatus/health.json?token=TvavttxFHJ4qhnKstDxrvBXM')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'deploy',
      value: Joi.equal(
        'success',
        'failure',
        'error',
        'working',
        'pending',
        'rejected'
      ),
    })
  )

t.create('unknown pipeline')
  .get('/DockbitStatus/unknown.json')
  .expectJSON({ name: 'deploy', value: 'not found' })

t.create('no deploy status')
  .get('/foo/bar.json?token=123')
  .intercept(nock =>
    nock('https://dockbit.com/')
      .get('/foo/bar/status/123')
      .reply(200, { state: null })
  )
  .expectJSON({ name: 'deploy', value: 'not found' })

t.create('server error')
  .get('/foo/bar.json?token=123')
  .intercept(nock =>
    nock('https://dockbit.com/')
      .get('/foo/bar/status/123')
      .reply(500, 'Something went wrong')
  )
  .expectJSON({ name: 'deploy', value: 'inaccessible' })

t.create('connection error')
  .get('/foo/bar.json')
  .networkOff()
  .expectJSON({ name: 'deploy', value: 'inaccessible' })
