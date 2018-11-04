'use strict'

const Joi = require('joi')
const ServiceTester = require('../service-tester')
const { colorScheme: colorsB } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const { isBuildStatus } = require('../test-validators')
const isAutomatedBuildStatus = Joi.string().valid('automated', 'manual')

const t = new ServiceTester({ id: 'docker', title: 'Docker Hub' })
module.exports = t

// stars endpoint

t.create('docker stars (valid, library)')
  .get('/stars/_/ubuntu.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
      colorB: Joi.any()
        .equal('#066da5')
        .required(),
    })
  )

t.create('docker stars (override colorB)')
  .get('/stars/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
      colorB: Joi.any()
        .equal('#fedcba')
        .required(),
    })
  )

t.create('docker stars (valid, user)')
  .get('/stars/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker stars',
      value: isMetric,
    })
  )

t.create('docker stars (not found)')
  .get('/stars/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker stars', value: 'repo not found' })

// pulls endpoint

t.create('docker pulls (valid, library)')
  .get('/pulls/_/ubuntu.json?style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
      colorB: Joi.any()
        .equal('#066da5')
        .required(),
    })
  )

t.create('docker pulls (override colorB)')
  .get('/pulls/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
      colorB: Joi.any()
        .equal('#fedcba')
        .required(),
    })
  )

t.create('docker pulls (valid, user)')
  .get('/pulls/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker pulls',
      value: isMetric,
    })
  )

t.create('docker pulls (not found)')
  .get('/pulls/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker pulls', value: 'repo not found' })

// automated build endpoint

t.create('docker automated build (valid, library)')
  .get('/automated/_/ubuntu.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isAutomatedBuildStatus,
    })
  )

t.create('docker automated build (valid, user)')
  .get('/automated/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isAutomatedBuildStatus,
    })
  )

t.create('docker automated build (not found)')
  .get('/automated/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker build', value: 'repo not found' })

t.create('docker automated build - automated')
  .get('/automated/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: true })
  )
  .expectJSON({ name: 'docker build', value: 'automated', colorB: '#066da5' })

t.create('docker automated build - manual')
  .get('/automated/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: false })
  )
  .expectJSON({ name: 'docker build', value: 'manual', colorB: colorsB.yellow })

t.create('docker automated build - colorB override in manual')
  .get('/automated/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: false })
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isAutomatedBuildStatus,
      colorB: Joi.any()
        .equal('#fedcba')
        .required(),
    })
  )

t.create('docker automated build - colorB override in automated')
  .get('/automated/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu')
      .reply(200, { is_automated: true })
  )
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isAutomatedBuildStatus,
      colorB: Joi.any()
        .equal('#fedcba')
        .required(),
    })
  )

// build status endpoint

t.create('docker build status (valid, user)')
  .get('/build/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isBuildStatus,
    })
  )

t.create('docker build status (not found)')
  .get('/build/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker build', value: 'repo not found' })

t.create('docker build status (passing)')
  .get('/build/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 10 }] })
  )
  .expectJSON({
    name: 'docker build',
    value: 'passing',
    colorB: colorsB.brightgreen,
  })

t.create('docker build status (failing)')
  .get('/build/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: -1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'failing', colorB: colorsB.red })

t.create('docker build status (building)')
  .get('/build/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'building', colorB: '#066da5' })

t.create('docker build status (override colorB for passing)')
  .get('/build/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 10 }] })
  )
  .expectJSON({ name: 'docker build', value: 'passing', colorB: '#fedcba' })

t.create('docker build status (override colorB for failing)')
  .get('/build/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: -1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'failing', colorB: '#fedcba' })

t.create('docker build status (override colorB for building)')
  .get('/build/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'building', colorB: '#fedcba' })
