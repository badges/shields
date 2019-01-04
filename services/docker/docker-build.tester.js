'use strict'

const Joi = require('joi')
const { colorScheme: colorsB } = require('../test-helpers')
const { dockerBlue } = require('./docker-helpers')
const { isBuildStatus } = require('../test-validators')

const t = (module.exports = require('../create-service-tester')())

t.create('docker build status (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectJSONTypes(
    Joi.object().keys({
      name: 'docker build',
      value: isBuildStatus,
    })
  )

t.create('docker build status (not found)')
  .get('/_/not-a-real-repo.json')
  .expectJSON({ name: 'docker build', value: 'repo not found' })

t.create('docker build status (passing)')
  .get('/_/ubuntu.json?style=_shields_test')
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
  .get('/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: -1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'failing', colorB: colorsB.red })

t.create('docker build status (building)')
  .get('/_/ubuntu.json?style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 1 }] })
  )
  .expectJSON({
    name: 'docker build',
    value: 'building',
    colorB: `#${dockerBlue}`,
  })

t.create('docker build status (override colorB for passing)')
  .get('/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 10 }] })
  )
  .expectJSON({ name: 'docker build', value: 'passing', colorB: '#fedcba' })

t.create('docker build status (override colorB for failing)')
  .get('/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: -1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'failing', colorB: '#fedcba' })

t.create('docker build status (override colorB for building)')
  .get('/_/ubuntu.json?colorB=fedcba&style=_shields_test')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 1 }] })
  )
  .expectJSON({ name: 'docker build', value: 'building', colorB: '#fedcba' })
