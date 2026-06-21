import { testAuth } from '../test-helpers.js'
import AzureDevOpsBuild from './azure-devops-build.service.js'

describe('AzureDevOpsBuild', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(AzureDevOpsBuild, 'BasicAuth', {
        count: 1,
        value: [{ id: 12345, status: 'completed', result: 'succeeded' }],
      })
    })
  })
})
