import { testAuth } from '../test-helpers.js'
import AzureDevOpsTests from './azure-devops-tests.service.js'

describe('AzureDevOpsTests', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        AzureDevOpsTests,
        'BasicAuth',
        {
          aggregatedResultsAnalysis: {
            totalTests: 95,
            resultsByOutcome: {
              Passed: {
                count: 93,
              },
            },
          },
          count: 1,
          value: [
            {
              id: 90395,
            },
          ],
        },
        {
          multipleRequests: true,
        },
      )
    })
  })
})
