import { test, given } from 'sazerac'
import nock from 'nock'
import { expect } from 'chai'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import GitlabMergeRequests from './gitlab-merge-requests.service.js'
import GitLabTag from './gitlab-tag.service.js'

describe('GitlabMergeRequests', function () {
  test(GitlabMergeRequests.render, () => {
    given({ variant: 'open', mergeRequestCount: 1399 }).expect({
      label: 'merge requests',
      message: '1.4k open',
    })
    given({ variant: 'open', raw: '-raw', mergeRequestCount: 1399 }).expect({
      label: 'open merge requests',
      message: '1.4k',
    })
    given({
      variant: 'open',
      labels: 'discussion,enhancement',
      mergeRequestCount: 15,
    }).expect({
      label: 'discussion,enhancement merge requests',
      message: '15 open',
    })
    given({
      variant: 'open',
      raw: '-raw',
      labels: 'discussion,enhancement',
      mergeRequestCount: 15,
    }).expect({
      label: 'open discussion,enhancement merge requests',
      message: '15',
    })
    given({ variant: 'open', mergeRequestCount: 0 }).expect({
      label: 'merge requests',
      message: '0 open',
    })
    given({ variant: 'open', mergeRequestCount: 10001 }).expect({
      label: 'merge requests',
      message: 'more than 10k open',
    })
  })
  describe('auth', function () {
    cleanUpNockAfterEach()

    const fakeToken = 'abc123'
    const config = {
      public: {
        services: {
          gitlab: {
            authorizedOrigins: ['https://gitlab.com'],
          },
        },
      },
      private: {
        gitlab_token: fakeToken,
      },
    }

    it('sends the auth information as configured', async function () {
      const scope = nock('https://gitlab.com/')
        .get('/api/v4/projects/foo%2Fbar/repository/tags?order_by=updated')
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .matchHeader('Authorization', `Bearer ${fakeToken}`)
        .reply(200, [{ name: '1.9' }])

      expect(
        await GitLabTag.invoke(
          defaultContext,
          config,
          { project: 'foo/bar' },
          {}
        )
      ).to.deep.equal({
        message: 'v1.9',
        color: 'blue',
      })

      scope.done()
    })
  })
})
