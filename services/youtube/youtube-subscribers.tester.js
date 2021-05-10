'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const noYouTubeToken = noToken(require('./youtube-subscribers.service'))

t.create('subscriber count')
  .skipWhen(noYouTubeToken)
  .get('/UC8butISFwT-Wl7EV0hUK0BQ.json')
  .expectBadge({
    label: 'subscribers',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/channel/UC8butISFwT-Wl7EV0hUK0BQ'],
  })

t.create('channel not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'channel not found',
    color: 'red',
  })
