'use strict'

const Joi = require('joi')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

const isAutomatedBuildStatus = Joi.string().valid('automated', 'manual')

t.create('docker cloud automated build (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker build',
    message: isAutomatedBuildStatus,
  })

t.create('docker cloud automated build (not found)')
  .get('/badges/not-a-real-repo.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get('/api/build/v1/source/?image=badges/not-a-real-repo')
      .reply(404, { detail: 'Object not found' })
  )
  .expectBadge({ label: 'docker build', message: 'repo not found' })

t.create('docker cloud automated build - automated')
  .get('/xenolf/lego.json?style=_shields_test')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get('/api/build/v1/source/?image=xenolf/lego')
      .reply(200, { objects: [{ build_settings: ['test1'] }] })
  )
  .expectBadge({
    label: 'docker build',
    message: 'automated',
    color: `#${dockerBlue}`,
  })

t.create('docker cloud automated build - manual')
  .get('/xenolf/lego.json?style=_shields_test')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get('/api/build/v1/source/?image=xenolf/lego')
      .reply(200, { objects: [{ build_settings: [] }] })
  )
  .expectBadge({ label: 'docker build', message: 'manual', color: 'yellow' })
