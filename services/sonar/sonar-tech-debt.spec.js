import { test, given } from 'sazerac'
import { testAuth } from '../test-helpers.js'
import SonarTechDebt from './sonar-tech-debt.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarTechDebt', function () {
  test(SonarTechDebt.render, () => {
    given({ debt: 0 }).expect({
      label: undefined,
      message: '0%',
      color: 'brightgreen',
    })
    given({ debt: 10 }).expect({
      label: undefined,
      message: '10%',
      color: 'yellowgreen',
    })
    given({ debt: 20 }).expect({
      label: undefined,
      message: '20%',
      color: 'yellow',
    })
    given({ debt: 50, metric: 'tech_debt' }).expect({
      label: 'tech debt',
      message: '50%',
      color: 'orange',
    })
    given({ debt: 100, metric: 'sqale_debt_ratio' }).expect({
      label: 'sqale debt ratio',
      message: '100%',
      color: 'red',
    })
  })

  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarTechDebt,
        'BasicAuth',
        legacySonarResponse('sqale_debt_ratio', 95),
        { configOverride: testAuthConfigOverride },
      )
    })
  })
})
