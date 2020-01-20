'use strict'

const { isSemVer } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('docker size (valid, library)')
  .get('/_/ubuntu.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker size (valid, library with tag)')
  .get('/_/ubuntu/latest.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker size (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker size (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker size (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'version',
    message: 'unknown',
  })

t.create('docker size (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'version',
    message: 'invalid response data',
  })
