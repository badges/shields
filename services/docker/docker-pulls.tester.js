'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())
const { dockerBlue } = require('./docker-helpers')

t.create('docker pulls (valid, library)')
  .get('/_/ubuntu.json')
  .expectBadge({
    label: 'docker pulls',
    message: isMetric,
    color: `#${dockerBlue}`,
  })

t.create('docker pulls (valid, user)')
  .get('/jrottenberg/ffmpeg.json')
  .expectBadge({
    label: 'docker pulls',
    message: isMetric,
  })

t.create('docker pulls (not found)')
  .get('/_/not-a-real-repo.json')
  .expectBadge({ label: 'docker pulls', message: 'repo not found' })
