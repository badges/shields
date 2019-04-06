'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

t.create('docker cloud build status (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker build',
    message: isBuildStatus,
  })

t.create('docker cloud build status (not found)')
  .get('/badges/not-a-real-repo.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(
        `/api/build/v1/source?image=${encodeURIComponent(
          'badges/not-a-real-repo'
        )}`
      )
      .reply(404, { detail: 'Object not found' })
  )
  .expectBadge({ label: 'docker build', message: 'repo not found' })

t.create('docker cloud build status (passing)')
  .get('/xenolf/lego.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(`/api/build/v1/source?image=${encodeURIComponent('xenolf/lego')}`)
      .reply(200, { objects: [{ state: 'Success' }] })
  )
  .expectBadge({
    label: 'docker build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('docker cloud build status (failing)')
  .get('/xenolf/lego.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(`/api/build/v1/source?image=${encodeURIComponent('xenolf/lego')}`)
      .reply(200, { objects: [{ state: 'Failed' }] })
  )
  .expectBadge({ label: 'docker build', message: 'failing', color: 'red' })

t.create('docker cloud build status (building)')
  .get('/xenolf/lego.json')
  .intercept(nock =>
    nock('https://cloud.docker.com/')
      .get(`/api/build/v1/source?image=${encodeURIComponent('xenolf/lego')}`)
      .reply(200, { objects: [{ state: 'Empty' }] })
  )
  .expectBadge({
    label: 'docker build',
    message: 'building',
    color: `#${dockerBlue}`,
  })
