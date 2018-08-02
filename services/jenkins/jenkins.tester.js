'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')

const t = new ServiceTester({ id: 'jenkins', title: 'Jenkins' })
module.exports = t

t.create('cobertura: latest version')
  .get('/plugin/v/blueocean.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get('/current/update-center.actual.json')
      .reply(200, { plugins: { blueocean: { version: '1.1.6' } } })
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'plugin',
      value: Joi.string().regex(/^v(.*)$/),
    })
  )

t.create('cobertura: version 0')
  .get('/plugin/v/blueocean.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get('/current/update-center.actual.json')
      .reply(200, { plugins: { blueocean: { version: '0' } } })
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'plugin',
      value: Joi.string().regex(/^v0$/),
    })
  )

t.create('cobertura: inexistent artifact')
  .get('/plugin/v/inexistent-artifact-id.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get('/current/update-center.actual.json')
      .reply(200, { plugins: { blueocean: { version: '1.1.6' } } })
  )
  .expectJSON({ name: 'plugin', value: 'not found' })

t.create('cobertura: connection error')
  .get('/plugin/v/blueocean.json')
  .networkOff()
  .expectJSON({ name: 'plugin', value: 'inaccessible' })

t.create('jacoco: 81% | valid coverage')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage[covered,missed,percentage,total]'
      )
      .reply(200, {
        instructionCoverage: {
          covered: 39498,
          missed: 9508,
          percentage: 81,
          percentageFloat: 80.5983,
          total: 49006,
        },
      })
  )
  .expectJSONTypes({ name: 'coverage', value: '81%' })

t.create('jacoco: inaccessible | request error')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .networkOff()
  .expectJSONTypes({ name: 'coverage', value: 'inaccessible' })

t.create('jacoco: inaccessible | invalid coverage object')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage[covered,missed,percentage,total]'
      )
      .reply(200, {
        invalidCoverageObject: {
          covered: 39498,
          missed: 9508,
          percentage: 81,
          percentageFloat: 80.5983,
          total: 49006,
        },
      })
  )
  .expectJSONTypes({ name: 'coverage', value: 'inaccessible' })

t.create('jacoco: unknown | invalid coverage (non-numeric)')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage[covered,missed,percentage,total]'
      )
      .reply(200, {
        instructionCoverage: {
          covered: 39498,
          missed: 9508,
          percentage: 'non-numeric',
          percentageFloat: 80.5983,
          total: 49006,
        },
      })
  )
  .expectJSONTypes({ name: 'coverage', value: 'unknown' })

t.create('jacoco: unknown | exception handling')
  .get('/j/https/updates.jenkins-ci.org/job/hello-project/job/master.json')
  .intercept(nock =>
    nock('https://updates.jenkins-ci.org')
      .get(
        '/job/hello-project/job/master/lastBuild/jacoco/api/json?tree=instructionCoverage[covered,missed,percentage,total]'
      )
      .reply(200, {
        instructionCoverage: {
          covered: 39498,
          missed: 9508,
          percentage: '81.x',
          percentageFloat: 80.5983,
          total: 49006,
        },
      })
  )
  .expectJSONTypes({ name: 'coverage', value: 'unknown' })
