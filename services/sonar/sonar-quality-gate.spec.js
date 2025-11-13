import { test, given } from 'sazerac'
import { testAuth } from '../test-helpers.js'
import SonarQualityGate from './sonar-quality-gate.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarQualityGate', function () {
  test(SonarQualityGate.render, () => {
    given({ qualityState: 'OK' }).expect({
      message: 'passed',
      color: 'success',
    })
    given({ qualityState: 'ERROR' }).expect({
      message: 'failed',
      color: 'critical',
    })
  })

  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarQualityGate,
        'BasicAuth',
        legacySonarResponse('alert_status', 'OK'),
        { configOverride: testAuthConfigOverride },
      )
    })
  })
})
