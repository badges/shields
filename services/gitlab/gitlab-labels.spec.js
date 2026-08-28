import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import GitLabLabel from './gitlab-labels.service.js'

describe('GitLabLabel', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    const fakeToken = 'abd123'
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
        .get('/api/v4/projects/foo%2Fbar/labels/bug')
        // This ensures that the expected credentials are actually being sent with the HTTP request.
        // Without this the request wouldn't match and the test would fail.
        .matchHeader('Authorization', `Bearer ${fakeToken}`)
        .reply(200, {
          message: 'bug',
          color: '6699cc',
        })

      expect(
        await GitLabLabel.invoke(
          defaultContext,
          config,
          { project: 'foo/bar', name: 'bug' },
          {},
        ),
      ).to.deep.equal({
        message: 'bug',
        color: '6699cc',
      })

      scope.done()
    })
  })
})
