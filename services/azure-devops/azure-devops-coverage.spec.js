import { testAuth } from '../test-helpers.js'
import AzureDevOpsCoverage from './azure-devops-coverage.service.js'

describe('AzureDevOpsCoverage', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        AzureDevOpsCoverage,
        'BasicAuth',
        {
          coverageData: [
            {
              coverageStats: [
                {
                  label: 'Coverage',
                  total: 95,
                  covered: 93,
                },
              ],
            },
          ],
          count: 1,
          value: [
            {
              id: 90395,
            },
          ],
        },
        { multipleRequests: true },
      )
    })
  })
})
