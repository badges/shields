'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { isRelativeFormattedDate } = require('../test-validators')

t.create('docker date (valid, library)').get('/_/alpine.json').expectBadge({
  label: 'latest docker image',
  message: isRelativeFormattedDate,
})

t.create('docker date (valid, library with tag)')
  .get('/_/alpine/latest.json')
  .expectBadge({
    label: 'latest docker image',
    message: isRelativeFormattedDate,
  })

t.create('docker date (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'latest docker image',
    message: isRelativeFormattedDate,
  })

t.create('docker date (valid, user with tag)')
  .get('/jrottenberg/ffmpeg/3.2-alpine.json')
  .expectBadge({
    label: 'latest docker image',
    message: isRelativeFormattedDate,
  })

t.create('docker date (invalid, incorrect tag)')
  .get('/_/alpine/wrong-tag.json')
  .expectBadge({
    label: 'latest docker image',
    message: 'tag not found',
  })

t.create('docker date (invalid, unknown repository)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({
    label: 'latest docker image',
    message: 'repository not found',
  })
