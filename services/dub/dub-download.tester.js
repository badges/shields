'use strict'

const Joi = require('joi')
const { isMetric, isMetricOverTimePeriod } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

const isDownloadsColor = Joi.equal(
  'red',
  'yellow',
  'yellowgreen',
  'green',
  'brightgreen'
)

t.create('total downloads (valid)')
  .get('/dt/vibe-d.json')
  .expectBadge({
    label: 'downloads',
    message: isMetric,
    color: isDownloadsColor,
  })

t.create('total downloads, specific version (valid)')
  .get('/dt/vibe-d/0.8.4.json')
  .expectBadge({
    label: 'downloads@0.8.4',
    message: isMetric,
    color: isDownloadsColor,
  })
  .timeout(15000)

t.create('total downloads, latest version (valid)')
  .get('/dt/vibe-d/latest.json')
  .expectBadge({
    label: 'downloads@latest',
    message: isMetric,
    color: isDownloadsColor,
  })

t.create('daily downloads (valid)')
  .get('/dd/vibe-d.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: isDownloadsColor,
  })

t.create('weekly downloads (valid)')
  .get('/dw/vibe-d.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: isDownloadsColor,
  })

t.create('monthly downloads (valid)')
  .get('/dm/vibe-d.json')
  .expectBadge({
    label: 'downloads',
    message: isMetricOverTimePeriod,
    color: isDownloadsColor,
  })

t.create('total downloads (not found)')
  .get('/dt/not-a-package.json')
  .expectBadge({ label: 'downloads', message: 'not found' })
