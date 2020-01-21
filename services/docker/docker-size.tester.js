'use strict'

const { isFileSize } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('docker image size (valid, library with 1 page)')
  .get('/_/alpine.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, library with < 5 pages)')
  .get('/_/ubuntu.json')
  .timeout(150000)
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, library with > 25 pages)')
  .get('/_/node.json')
  .timeout(150000)
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, library with tag)')
  .get('/_/alpine/latest.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'image size',
    message: isFileSize,
  })

t.create('docker image size (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'image size',
    message: 'unknown',
  })

t.create('docker image size (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'image size',
    message: 'invalid response data',
  })
