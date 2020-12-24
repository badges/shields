'use strict'

const { isMetric } = require('../test-validators')
const { ServiceTester } = require('../tester')
const t = (module.exports = new ServiceTester({
  id: 'GithubIssuesSearch',
  title: 'Github Issues Search',
  pathPrefix: '/github',
}))

t.create('GitHub issue search (valid query string)')
  .get(
    '/issues-search.json?query=repo%3Abadges%2Fshields%20is%3Aclosed%20label%3Ablocker%20'
  )
  .expectBadge({
    label: 'query',
    message: isMetric,
  })

t.create('GitHub issue search (invalid query string)')
  .get('/issues-search.json?query=')
  .expectBadge({
    label: 'query',
    message: 'invalid query parameter: query',
  })

t.create('GitHub Repo issue search (valid query string)')
  .get(
    '/issues-search/badges/shields.json?query=is%3Aclosed%20label%3Ablocker%20'
  )
  .expectBadge({
    label: 'query',
    message: isMetric,
  })

t.create('GitHub Repo issue search (invalid query string)')
  .get('/issues-search/badges/shields.json?query=')
  .expectBadge({
    label: 'query',
    message: 'invalid query parameter: query',
  })

t.create('GitHub Repo issue search (invalid repo)')
  .get(
    '/issues-search/badges/helmets.json?query=is%3Aclosed%20label%3Ablocker%20'
  )
  .expectBadge({
    label: 'query',
    message: '0',
  })
