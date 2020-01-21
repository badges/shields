'use strict'

const { isSemVer } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('docker version (valid, library with 1 page)')
  .get('/_/alpine.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker version (valid, library with < 5 pages)')
  .get('/_/ubuntu.json')
  .timeout(150000)
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker version (valid, library with > 25 pages)')
  .get('/_/node.json')
  .timeout(150000)
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker version (valid, library with tag)')
  .get('/_/alpine/latest.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker version (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker version (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'version',
    message: isSemVer,
  })

t.create('docker version (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'version',
    message: 'unknown',
  })

t.create('docker version (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'version',
    message: 'invalid response data',
  })
