import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import GitLabRelease from './gitlab-release.service.js'

describe('GitLabRelease', function () {
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
        .get('/api/v4/projects/foo%2Fbar/releases?page=1')
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .matchHeader('Authorization', `Bearer ${fakeToken}`)
        .reply(200, [{ name: '1.9', tag_name: '1.9' }])

      expect(
        await GitLabRelease.invoke(
          defaultContext,
          config,
          { project: 'foo/bar' },
          {},
        ),
      ).to.deep.equal({
        label: undefined,
        message: 'v1.9',
        color: 'blue',
      })

      scope.done()
    })
  })
})
