import { testAuth } from '../test-helpers.js'
import SonarFortifyRating from './sonar-fortify-rating.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarFortifyRating', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarFortifyRating,
        'BasicAuth',
        legacySonarResponse('fortify-security-rating', 4),
        { configOverride: testAuthConfigOverride },
      )
    })
  })
})
