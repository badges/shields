'use strict'

const Joi = require('joi')
const { isBuildStatus } = require('../build-status')
const { invalidJSON } = require('../response-fixtures')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'buildkite',
  title: 'Buildkite Builds',
}))

t.create('buildkite invalid pipeline')
  .get('/unknown-identifier/unknown-branch.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('buildkite valid pipeline')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/master.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('buildkite valid pipeline skipping branch')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json')
  .expectBadge({
    label: 'build',
    message: Joi.alternatives().try(isBuildStatus, Joi.equal('unknown')),
  })

t.create('buildkite unknown branch')
  .get(
    '/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489/unknown-branch.json'
  )
  .expectBadge({ label: 'build', message: 'unknown' })

t.create('buildkite connection error')
  .get('/_.json')
  .networkOff()
  .expectBadge({ label: 'build', message: 'inaccessible' })

t.create('buildkite unexpected response')
  .get('/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json')
  .intercept(nock =>
    nock('https://badge.buildkite.com')
      .get(
        '/3826789cf8890b426057e6fe1c4e683bdf04fa24d498885489.json?branch=master'
      )
      .reply(invalidJSON)
  )
  .expectBadge({ label: 'build', message: 'invalid' })
