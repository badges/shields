import { noToken } from '../test-helpers.js'
import { isMetricAllowNegative } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
import _serviceClass from './subreddit-subscribers.service.js'
export const t = await createServiceTester()
const noRedditToken = noToken(_serviceClass)
const hasRedditToken = () => !noRedditToken()

t.create('user-karma (valid - link)')
  .get('/link/user_simulator.json')
  .expectBadge({
    label: 'u/user_simulator karma (link)',
    message: isMetricAllowNegative,
  })

t.create('user-karma (valid - comment')
  .get('/comment/user_simulator.json')
  .expectBadge({
    label: 'u/user_simulator karma (comment)',
    message: isMetricAllowNegative,
  })

t.create('user-karma (valid - combined)')
  .get('/combined/user_simulator.json')
  .expectBadge({
    label: 'u/user_simulator karma',
    message: isMetricAllowNegative,
  })

t.create('user-karma (non-existing user)')
  .get('/combined/thisuserdoesnotexistandhopefullyneverwill.json')
  .expectBadge({
    label: 'reddit karma',
    message: 'user not found',
  })

t.create('user-karma (link - math check, without token)')
  .skipWhen(hasRedditToken)
  .get('/link/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } }),
  )
  .expectBadge({
    label: 'u/user_simulator karma (link)',
    message: '20',
  })

t.create('user-karma (link - math check, with token)')
  .skipWhen(noRedditToken)
  .get('/link/user_simulator.json')
  .intercept(nock =>
    nock('https://oauth.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } }),
  )
  .networkOn() // API /access_token may or may not be called depending on whether another test ran before and cached the token. Rather than conditionally intercepting it, let it go through and only mock the API call we're validating specific behaviour against.
  .expectBadge({
    label: 'u/user_simulator karma (link)',
    message: '20',
  })

t.create('user-karma (comment - math check, without token)')
  .skipWhen(hasRedditToken)
  .get('/comment/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } }),
  )
  .expectBadge({
    label: 'u/user_simulator karma (comment)',
    message: '80',
  })

t.create('user-karma (comment - math check, with token)')
  .skipWhen(noRedditToken)
  .get('/comment/user_simulator.json')
  .intercept(nock =>
    nock('https://oauth.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } }),
  )
  .networkOn() // API /access_token may or may not be called depending on whether another test ran before and cached the token. Rather than conditionally intercepting it, let it go through and only mock the API call we're validating specific behaviour against.
  .expectBadge({
    label: 'u/user_simulator karma (comment)',
    message: '80',
  })

t.create('user-karma (combined - math check, without token)')
  .skipWhen(hasRedditToken)
  .get('/combined/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } }),
  )
  .expectBadge({
    label: 'u/user_simulator karma',
    message: '100',
  })

t.create('user-karma (combined - math check, with token)')
  .skipWhen(noRedditToken)
  .get('/combined/user_simulator.json')
  .intercept(nock =>
    nock('https://oauth.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } }),
  )
  .networkOn() // API /access_token may or may not be called depending on whether another test ran before and cached the token. Rather than conditionally intercepting it, let it go through and only mock the API call we're validating specific behaviour against.
  .expectBadge({
    label: 'u/user_simulator karma',
    message: '100',
  })

t.create('user-karma (combined - missing data, without token)')
  .skipWhen(hasRedditToken)
  .get('/combined/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20 } }),
  )
  .expectBadge({
    label: 'reddit karma',
    message: 'invalid response data',
  })

t.create('user-karma (combined - missing data, with token)')
  .skipWhen(noRedditToken)
  .get('/combined/user_simulator.json')
  .intercept(nock =>
    nock('https://oauth.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20 } }),
  )
  .networkOn() // API /access_token may or may not be called depending on whether another test ran before and cached the token. Rather than conditionally intercepting it, let it go through and only mock the API call we're validating specific behaviour against.
  .expectBadge({
    label: 'reddit karma',
    message: 'invalid response data',
  })
