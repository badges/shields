import { testAuth } from '../test-helpers.js'
import SonarCoverage from './sonar-coverage.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarCoverage', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarCoverage,
        'BasicAuth',
        legacySonarResponse('coverage', 95),
        { configOverride: testAuthConfigOverride },
      )
    })
  })
})
