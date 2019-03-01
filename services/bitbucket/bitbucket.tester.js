'use strict'

const { ServiceTester } = require('../tester')
const { isMetric, isMetricOpenIssues } = require('../test-validators')
const { isBuildStatus } = require('../build-status')
const {
  mockBitbucketCreds,
  mockBitbucketServerCreds,
  restore,
  user,
  pass,
} = require('./bitbucket-test-helpers')

const t = (module.exports = new ServiceTester({
  id: 'bitbucket',
  title: 'Bitbucket badges',
}))

// tests for issues endpoints

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

// tests for pull requests endpoints

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

t.create('pr (valid)')
  .get('/pr/atlassian/python-bitbucket.json')
  .expectBadge({
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

t.create('pr (auth)')
  .before(mockBitbucketCreds)
  .get('/pr/atlassian/python-bitbucket.json')
  .intercept(nock =>
    nock('https://bitbucket.org/api/2.0/repositories/')
      .get(/.*/)
      .basicAuth({ user, pass })
      .reply(200, { size: 42 })
  )
  .finally(restore)
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })

t.create('pr (server, auth)')
  .before(mockBitbucketServerCreds)
  .get('/pr/project/repo.json?server=https://bitbucket.mydomain.net')
  .intercept(nock =>
    nock('https://bitbucket.mydomain.net/rest/api/1.0/projects')
      .get(/.*/)
      .basicAuth({ user, pass })
      .reply(200, { size: 42 })
  )
  .finally(restore)
  .expectBadge({
    label: 'pull requests',
    message: isMetricOpenIssues,
  })
// tests for Bitbucket Pipelines

function bitbucketApiResponse(status) {
  return JSON.stringify({
    values: [
      {
        state: {
          type: 'pipeline_state_completed',
          name: 'COMPLETED',
          result: {
            type: 'pipeline_state_completed_xyz',
            name: status,
          },
        },
      },
    ],
  })
}

t.create('master build result (valid)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('master build result (not found)')
  .get('/pipelines/atlassian/not-a-repo.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('branch build result (valid)')
  .get(
    '/pipelines/atlassian/adf-builder-javascript/shields-test-dont-remove.json'
  )
  .expectBadge({
    label: 'build',
    message: isBuildStatus,
  })

t.create('branch build result (not found)')
  .get('/pipelines/atlassian/not-a-repo/some-branch.json')
  .expectBadge({ label: 'build', message: 'not found' })

t.create('branch build result (never built)')
  .get('/pipelines/atlassian/adf-builder-javascript/some/new/branch.json')
  .expectBadge({ label: 'build', message: 'never built' })

t.create('build result (passing)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('SUCCESSFUL'))
  )
  .expectBadge({ label: 'build', message: 'passing' })

t.create('build result (failing)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('FAILED'))
  )
  .expectBadge({ label: 'build', message: 'failing' })

t.create('build result (error)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('ERROR'))
  )
  .expectBadge({ label: 'build', message: 'error' })

t.create('build result (stopped)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('STOPPED'))
  )
  .expectBadge({ label: 'build', message: 'stopped' })

t.create('build result (expired)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('EXPIRED'))
  )
  .expectBadge({ label: 'build', message: 'expired' })

t.create('build result (unexpected status)')
  .get('/pipelines/atlassian/adf-builder-javascript.json')
  .intercept(nock =>
    nock('https://api.bitbucket.org')
      .get(/^\/2.0\/.*/)
      .reply(200, bitbucketApiResponse('NEW_AND_UNEXPECTED'))
  )
  .expectBadge({ label: 'build', message: 'invalid response data' })
