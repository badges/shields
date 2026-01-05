import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubIssueDetailRedirect',
  title: 'GithubIssueDetailRedirect',
  pathPrefix: '/github',
})

t.create('github issue detail (s shorthand)')
  .get('/issues/detail/s/badges/shields/979.json')
  .expectBadge({
    label: 'github',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('github issue detail (u shorthand)')
  .get('/issues/detail/u/badges/shields/979.json')
  .expectBadge({
    label: 'github',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('github pulls detail (s shorthand)')
  .get('/pulls/detail/s/badges/shields/979.json')
  .expectBadge({
    label: 'github',
    message: 'https://github.com/badges/shields/pull/11583',
  })

t.create('github pulls detail (u shorthand)')
  .get('/pulls/detail/u/badges/shields/979.json')
  .expectBadge({
    label: 'github',
    message: 'https://github.com/badges/shields/pull/11583',
  })
