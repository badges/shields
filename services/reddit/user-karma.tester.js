import { isMetricAllowNegative } from '../test-validators.js'
import { createServiceTester } from '../tester.js'
export const t = await createServiceTester()

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

t.create('user-karma (link - math check)')
  .get('/link/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } })
  )
  .expectBadge({
    label: 'u/user_simulator karma (link)',
    message: '20',
  })

t.create('user-karma (comment - math check)')
  .get('/comment/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } })
  )
  .expectBadge({
    label: 'u/user_simulator karma (comment)',
    message: '80',
  })

t.create('user-karma (combined - math check)')
  .get('/combined/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20, comment_karma: 80 } })
  )
  .expectBadge({
    label: 'u/user_simulator karma',
    message: '100',
  })

t.create('user-karma (combined - missing data)')
  .get('/combined/user_simulator.json')
  .intercept(nock =>
    nock('https://www.reddit.com/u')
      .get('/user_simulator/about.json')
      .reply(200, { kind: 't2', data: { link_karma: 20 } })
  )
  .expectBadge({
    label: 'reddit karma',
    message: 'invalid response data',
  })
