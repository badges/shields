'use strict'

const t = (module.exports = require('../tester').createServiceTester())
const { noToken } = require('../test-helpers')
const { isMetric } = require('../test-validators')
const noYouTubeToken = noToken(require('./youtube-subscribers.service'))

t.create('subscriber count')
  .skipWhen(noYouTubeToken)
  .get('/UCTNq28Ah5eyDgsYOA0oHzew.json')
  .expectBadge({
    label: 'subscribers',
    message: isMetric,
    color: 'red',
    link: ['https://www.youtube.com/channel/UCTNq28Ah5eyDgsYOA0oHzew'],
  })

t.create('channel not found')
  .skipWhen(noYouTubeToken)
  .get('/doesnotexist.json')
  .expectBadge({
    label: 'youtube',
    message: 'channel not found',
    color: 'red',
  })
