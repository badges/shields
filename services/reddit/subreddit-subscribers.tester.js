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
  .get('/badfbasdfadfadfadfadfasdf.json')
  .expectBadge({
    label: 'reddit',
    message: 'subreddit not found',
  })

t.create('subreddit-subscribers (not existing subreddit)')
  .get('/not-a-real-rubreddit.json')
  .expectBadge({
    label: 'reddit',
    message: 'subreddit not found',
  })
