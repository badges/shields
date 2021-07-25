import { ServiceTester } from '../tester.js'
import { isMetric, isMetricOpenIssues } from '../test-validators.js'

export const t = new ServiceTester({
  id: 'BitbucketPullRequest',
  title: 'Bitbucket Pull Request',
  pathPrefix: '/bitbucket',
})

t.create('pr-raw (valid)')
  .get('/pr-raw/atlassian/python-bitbucket.json')
  .expectBadge({
    label: 'pull requests',
    message: isMetric,
  })

t.create('pr-raw (not found)')
  .get('/pr-raw/atlassian/not-a-repo.json')
  .expectBadge({ label: 'pull requests', message: 'not found' })

t.create('pr-raw (private repo)')
  .get('/pr-raw/chris48s/example-private-repo.json')
  .expectBadge({ label: 'pull requests', message: 'private repo' })

t.create('pr (valid)').get('/pr/atlassian/python-bitbucket.json').expectBadge({
  label: 'pull requests',
  message: isMetricOpenIssues,
})

t.create('pr (not found)')
  .get('/pr/atlassian/not-a-repo.json')
  .expectBadge({ label: 'pull requests', message: 'not found' })

t.create('pr (private repo)')
  .get('/pr/chris48s/example-private-repo.json')
  .expectBadge({ label: 'pull requests', message: 'private repo' })

t.create('pr (server)')
  .get('/pr/project/repo.json?server=https://bitbucket.mydomain.net')
  .intercept(nock =>
    nock('https://bitbucket.mydomain.net/rest/api/1.0/projects')
      .get('/project/repos/repo/pull-requests')
      .query({
        state: 'OPEN',
        limit: 100,
        withProperties: false,
        withAttributes: false,
      })
      .reply(200, { size: 42 })
  )
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })

t.create('pr (server, invalid credentials)')
  .get('/pr/project/repo.json?server=https://bitbucket.mydomain.net')
  .intercept(nock =>
    nock('https://bitbucket.mydomain.net/rest/api/1.0/projects')
      .get('/project/repos/repo/pull-requests')
      .query({
        state: 'OPEN',
        limit: 100,
        withProperties: false,
        withAttributes: false,
      })
      .reply(401)
  )
  .expectBadge({
    label: 'pull requests',
    message: 'invalid credentials',
  })

t.create('pr (server, private repo)')
  .get('/pr/project/repo.json?server=https://bitbucket.mydomain.net')
  .intercept(nock =>
    nock('https://bitbucket.mydomain.net/rest/api/1.0/projects')
      .get('/project/repos/repo/pull-requests')
      .query({
        state: 'OPEN',
        limit: 100,
        withProperties: false,
        withAttributes: false,
      })
      .reply(403)
  )
  .expectBadge({
    label: 'pull requests',
    message: 'private repo',
  })

t.create('pr (server, not found)')
  .get('/pr/project/repo.json?server=https://bitbucket.mydomain.net')
  .intercept(nock =>
    nock('https://bitbucket.mydomain.net/rest/api/1.0/projects')
      .get('/project/repos/repo/pull-requests')
      .query({
        state: 'OPEN',
        limit: 100,
        withProperties: false,
        withAttributes: false,
      })
      .reply(404)
  )
  .expectBadge({
    label: 'pull requests',
    message: 'not found',
  })
