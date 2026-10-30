import { expect } from 'chai'
import nock from 'nock'
import {
  cleanUpNockAfterEach,
  defaultContext,
  testAuth,
} from '../test-helpers.js'
import ReadTheDocs from './readthedocs.service.js'

describe('ReadTheDocs', function () {
  describe('auth', function () {
    cleanUpNockAfterEach()

    it('sends the auth information as configured', async function () {
      return testAuth(
        ReadTheDocs,
        'BearerAuthHeader',
        {
          results: [
            {
              state: { code: 'finished' },
              success: true,
            },
          ],
        },
        {
          bearerHeaderKey: 'Token',
          exampleOverride: { project: 'pip' },
        },
      )
    })

    it('does not send the readthedocs.org token to readthedocs.com', async function () {
      const scope = nock('https://app.readthedocs.com', {
        badheaders: ['authorization'],
      })
        .get('/api/v3/projects/xanaduai-pennylane/versions/latest/builds/')
        .query(true)
        .reply(200, {
          results: [{ state: { code: 'finished' }, success: true }],
        })

      expect(
        await ReadTheDocs.invoke(
          defaultContext,
          { private: { readthedocs_token: 'fake-token' } },
          { domain: 'com', project: 'xanaduai-pennylane' },
        ),
      ).to.deep.equal({
        label: undefined,
        message: 'passing',
        color: 'brightgreen',
      })

      scope.done()
    })
  })
})
