'use strict'

const Joi = require('@hapi/joi')
const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const noYouTubeToken = noToken(require('./youtube-likes.service'))

t.create('video like count')
  .skipWhen(noYouTubeToken)
  .get('/pU9Q6oiQNd0.json')
  .expectBadge({
    label: 'likes',
    message: isMetric,
    color: 'red',
  })

t.create('video vote count')
  .skipWhen(noYouTubeToken)
  .get('/pU9Q6oiQNd0.json?withDislikes')
  .expectBadge({
    label: 'votes',
    message: Joi.string().regex(
      /^([1-9][0-9]*[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) 👍 ([1-9][0-9]*[kMGTPEZY]?|[1-9]\.[1-9][kMGTPEZY]) 👎$/
    ),
    color: 'red',
  })

t.create('video not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json?withDislikes')
  .expectBadge({
    label: 'youtube',
    message: 'video not found',
    color: 'red',
  })
