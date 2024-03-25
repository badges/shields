import { testAuth } from '../test-helpers.js'
import TeamCityCoverage from './teamcity-coverage.service.js'
import { config } from './teamcity-test-helpers.js'

describe('TeamCityCoverage', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      testAuth(
        TeamCityCoverage,
        'BasicAuth',
        {
          property: [
            { name: 'CodeCoverageAbsSCovered', value: '93' },
            { name: 'CodeCoverageAbsSTotal', value: '95' },
          ],
        },
        { configOverride: config },
      )
    })
  })
})
