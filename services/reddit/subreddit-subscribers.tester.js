import { noToken } from '../test-helpers.js'
import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import _serviceClass from './subreddit-subscribers.service.js'
export const t = await createServiceTester()
const noRedditToken = noToken(_serviceClass)
const hasRedditToken = () => !noRedditToken()

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

t.create('subreddit-subscribers (private sub)')
  .get('/centuryclub.json')
  .expectBadge({
    label: 'reddit',
    message: 'subreddit is private',
  })

t.create('subreddit-subscribers (private sub, without token)')
  .skipWhen(hasRedditToken)
  .get('/centuryclub.json')
  .intercept(nock =>
    nock('https://www.reddit.com/r')
      .get('/centuryclub/about.json')
      .reply(200, { kind: 't5', data: {} }),
  )
  .expectBadge({
    label: 'reddit',
    message: 'subreddit not found',
  })

t.create('subreddit-subscribers (private sub, with token)')
  .skipWhen(noRedditToken)
  .get('/centuryclub.json')
  .intercept(nock =>
    nock('https://oauth.reddit.com/r')
      .get('/centuryclub/about.json')
      .reply(200, { kind: 't5', data: {} }),
  )
  .networkOn() // API /access_token may or may not be called depending on whether another test ran before and cached the token. Rather than conditionally intercepting it, let it go through and only mock the API call we're validating specific behaviour against.
  .expectBadge({
    label: 'reddit',
    message: 'subreddit not found',
  })
