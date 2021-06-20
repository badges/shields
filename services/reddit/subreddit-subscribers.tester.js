import { isMetric } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

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

t.create('subreddit-subscribers (private sub)')
  .get('/centuryclub.json')
  .intercept(nock =>
    nock('https://www.reddit.com/r')
      .get('/centuryclub/about.json')
      .reply(200, { kind: 't5', data: {} })
  )
  .expectBadge({
    label: 'reddit',
    message: 'subreddit not found',
  })
