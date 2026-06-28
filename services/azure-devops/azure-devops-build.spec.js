import { testAuth } from '../test-helpers.js'
import AzureDevOpsBuild from './azure-devops-build.service.js'

describe('AzureDevOpsBuild', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      // Exercise the overall-build path (no stage/job) so a single mocked
      // request is sufficient; the auth header is sent the same way regardless.
      return testAuth(
        AzureDevOpsBuild,
        'BasicAuth',
        {
          count: 1,
          value: [{ id: 12345, status: 'completed', result: 'succeeded' }],
        },
        { exampleOverride: { stage: undefined, job: undefined } },
      )
    })
  })
})
