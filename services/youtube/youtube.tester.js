'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const noYouTubeToken = noToken(require('./youtube.service'))

t.create('video view count')
  .skipWhen(noYouTubeToken)
  .get('/view/abBdk8bSPKU.json')
  .expectBadge({
    label: 'views',
    message: isMetric,
    color: 'red',
  })

t.create('video like count')
  .skipWhen(noYouTubeToken)
  .get('/like/pU9Q6oiQNd0.json')
  .expectBadge({
    label: 'likes',
    message: isMetric,
    color: 'red',
  })

t.create('video dislike count')
  .skipWhen(noYouTubeToken)
  .get('/dislike/kJS9ViONCRc.json')
  .expectBadge({
    label: 'dislikes',
    message: isMetric,
    color: 'red',
  })

t.create('video comment count')
  .skipWhen(noYouTubeToken)
  .get('/comment/wGJHwc5ksMA.json')
  .expectBadge({
    label: 'comments',
    message: isMetric,
    color: 'red',
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/comment/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
