'use strict'

const { isBuildStatus } = require('../build-status')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

t.create('docker build status (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker build',
    message: isBuildStatus,
  })

t.create('docker build status (not found)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'docker build', message: 'repo not found' })

t.create('docker build status (passing)')
  .get('/_/ubuntu.json')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 10 }] })
  )
  .expectBadge({
    label: 'docker build',
    message: 'passing',
    color: 'brightgreen',
  })

t.create('docker build status (failing)')
  .get('/_/ubuntu.json')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: -1 }] })
  )
  .expectBadge({ label: 'docker build', message: 'failing', color: 'red' })

t.create('docker build status (building)')
  .get('/_/ubuntu.json')
  .intercept(nock =>
    nock('https://registry.hub.docker.com/')
      .get('/v2/repositories/library/ubuntu/buildhistory')
      .reply(200, { results: [{ status: 1 }] })
  )
  .expectBadge({
    label: 'docker build',
    message: 'building',
    color: `#${dockerBlue}`,
  })
