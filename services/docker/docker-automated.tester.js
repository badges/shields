'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

const isAutomatedBuildStatus = Joi.string().valid('automated', 'manual')

t.create('docker automated build (valid, library)')
  .get('/_/ubuntu.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isAutomatedBuildStatus,
    })
  )

t.create('docker automated build (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isAutomatedBuildStatus,
    })
  )

t.create('docker automated build (not found)')
  .get('/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker build', value: 'repo not found' })

t.create('docker automated build - automated')
  .get('/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: true })
  )
  .expectJSON({
    name: 'docker build',
    value: 'automated',
    color: `#${dockerBlue}`,
  })

t.create('docker automated build - manual')
  .get('/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: false })
  )
  .expectJSON({ name: 'docker build', value: 'manual', color: 'yellow' })
