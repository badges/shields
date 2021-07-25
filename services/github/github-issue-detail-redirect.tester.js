import { ServiceTester } from '../tester.js'

export const t = new ServiceTester({
  id: 'GithubIssueDetailRedirect',
  title: 'GithubIssueDetailRedirect',
  pathPrefix: '/github',
})

t.create('github issue detail (s shorthand)')
  .get('/issues/detail/s/badges/shields/979.svg')
  .expectRedirect('/github/issues/detail/state/badges/shields/979.svg')

t.create('github issue detail (u shorthand)')
  .get('/issues/detail/u/badges/shields/979.svg')
  .expectRedirect('/github/issues/detail/author/badges/shields/979.svg')

t.create('github pulls detail (s shorthand)')
  .get('/pulls/detail/s/badges/shields/979.svg')
  .expectRedirect('/github/pulls/detail/state/badges/shields/979.svg')

t.create('github pulls detail (u shorthand)')
  .get('/pulls/detail/u/badges/shields/979.svg')
  .expectRedirect('/github/pulls/detail/author/badges/shields/979.svg')
