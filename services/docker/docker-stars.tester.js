'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

t.create('docker stars (valid, library)')
  .get('/_/ubuntu.json')
  .expectBadge({
    label: 'docker stars',
    message: isMetric,
    color: `#${dockerBlue}`,
  })

t.create('docker stars (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker stars',
    message: isMetric,
  })

t.create('docker stars (not found)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'docker stars', message: 'repo not found' })
