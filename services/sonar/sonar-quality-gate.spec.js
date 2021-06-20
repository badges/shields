import { test, given } from 'sazerac'
import SonarQualityGate from './sonar-quality-gate.service.js'

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
})
