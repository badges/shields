import { testAuth } from '../test-helpers.js'
import ReadTheDocs from './readthedocs.service.js'

describe('ReadTheDocs', function () {
  describe('auth', function () {
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
  })
})
