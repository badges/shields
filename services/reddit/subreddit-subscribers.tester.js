'use strict'

const { isMetric } = require('../test-validators')
const t = (module.exports = require('../tester').createServiceTester())

t.create('subreddit-subscribers (valid subreddit)')
  .get('/drums.json')
  .expectBadge({
    label: 'follow r/drums',
    message: isMetric,
  })

t.create('subreddit-subscribers (invalid subreddit)')
  .get('/not-a-real-subreddit.json')
  .expectBadge({
    label: 'reddit',
    message: 'not found',
  })
