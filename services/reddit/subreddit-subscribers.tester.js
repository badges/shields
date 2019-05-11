'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')

const t = (module.exports = new ServiceTester({
  id: 'subreddit-subscribers',
  title: 'Subreddit subscribers',
}))

t.create('subreddit-subscribers (valid subreddit)')
  .get('/subreddit-subscribers/drums.svg')
  .expectBadge({
    label: 'follow r/drums',
    message: isMetric,
  })

t.create('subreddit-subscribers (invalid subreddit)')
  .get('/subreddit-subscribers/not-a-real-subreddit.svg')
  .expectBadge({
    label: 'reddit',
    message: 'not found',
  })
