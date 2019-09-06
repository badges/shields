'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isMetricOpenIssues } = require('../test-validators')

const t = (module.exports = new ServiceTester({
  id: 'BitbucketIssues',
  title: 'Bitbucket Issues',
  pathPrefix: '/bitbucket',
}))

t.create('issues-raw (valid)')
  .get('/issues-raw/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'issues',
    message: isMetric,
  })

t.create('issues-raw (not found)')
  .get('/issues-raw/atlassian/not-a-repo.json')
  .expectBadge({ label: 'issues', message: 'not found' })

t.create('issues-raw (private repo)')
  .get('/issues-raw/chris48s/example-private-repo.json')
  .expectBadge({ label: 'issues', message: 'private repo' })

t.create('issues (valid)')
  .get('/issues/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'issues',
    message: isMetricOpenIssues,
  })

t.create('issues (not found)')
  .get('/issues/atlassian/not-a-repo.json')
  .expectBadge({ label: 'issues', message: 'not found' })

t.create('issues (private repo)')
  .get('/issues/chris48s/example-private-repo.json')
  .expectBadge({ label: 'issues', message: 'private repo' })
