'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const noYouTubeToken = noToken(require('./youtube-comments.service'))

t.create('video comment count')
  .skipWhen(noYouTubeToken)
  .get('/wGJHwc5ksMA.json')
  .expectBadge({
    label: 'comments',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/watch?v=wGJHwc5ksMA'],
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
