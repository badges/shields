import { testAuth } from '../test-helpers.js'
import SonarGeneric from './sonar-generic.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarGeneric', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarGeneric,
        'BasicAuth',
        legacySonarResponse('test', 903),
        {
          configOverride: testAuthConfigOverride,
          exampleOverride: {
            component: 'test',
            metricName: 'test',
            branch: 'home',
            server:
              testAuthConfigOverride.public.services.sonar.authorizedOrigins[0],
            sonarVersion: '4.2',
          },
        },
      )
    })
  })
})
