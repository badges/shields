'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('subreddit-subscribers (valid subreddit)')
  .get('/subreddit-subscribers/drums.json')
  .expectBadge({
    label: 'follow r/drums',
    message: isMetric,
  })

t.create('subreddit-subscribers (invalid subreddit)')
  .get('/subreddit-subscribers/not-a-real-subreddit.json')
  .expectBadge({
    label: 'reddit',
    message: 'not found',
  })
