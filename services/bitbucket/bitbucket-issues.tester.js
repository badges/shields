import { ServiceTester } from '../tester.js'
import { isMetric, isMetricOpenIssues } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'BitbucketIssues',
  title: 'Bitbucket Issues',
  pathPrefix: '/bitbucket',
})

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
