import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import GitLabTag from './gitlab-tag.service.js'

describe('GitLabTag', function () {
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
        .basicAuth({ user: '', pass: fakeToken })
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
