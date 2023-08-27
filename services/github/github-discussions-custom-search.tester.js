import { isMetric } from '../test-validators.js'
import { ServiceTester } from '../tester.js'
export const t = new ServiceTester({
  id: 'GithubDiscussionsSearch',
  title: 'Github Discussions Search',
  pathPrefix: '/github',
})

t.create('GitHub discussions search (valid query string)')
  .get(
    '/discussions-search.json?query=repo%3Abadges%2Fshields%20is%3Aanswered%20author%3Achris48s',
  )
  .expectBadge({
    label: 'query',
    message: isMetric,
  })

t.create('GitHub discussions search (invalid query string)')
  .get('/discussions-search.json?query=')
  .expectBadge({
    label: 'query',
    message: 'invalid query parameter: query',
  })

t.create('GitHub Repo discussions search (valid query string)')
  .get(
    '/discussions-search/badges/shields.json?query=is%3Aanswered%20author%3Achris48s',
  )
  .expectBadge({
    label: 'query',
    message: isMetric,
  })

t.create('GitHub Repo discussions search (invalid query string)')
  .get('/discussions-search/badges/shields.json?query=')
  .expectBadge({
    label: 'query',
    message: 'invalid query parameter: query',
  })

t.create('GitHub Repo discussions search (invalid repo)')
  .get(
    '/discussions-search/badges/helmets.json?query=is%3Aanswered%20author%3Achris48s',
  )
  .expectBadge({
    label: 'query',
    message: '0',
  })
