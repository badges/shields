'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const noYouTubeToken = noToken(require('./youtube-views.service'))

t.create('video view count')
  .skipWhen(noYouTubeToken)
  .get('/abBdk8bSPKU.json')
  .expectBadge({
    label: 'views',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/watch?v=abBdk8bSPKU'],
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
