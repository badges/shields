import { test, given } from 'sazerac'
import { testAuth } from '../test-helpers.js'
import { SonarTests } from './sonar-tests.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarTests', function () {
  test(SonarTests.render, () => {
    given({ value: 0, metric: 'test_failures' }).expect({
      label: 'test failures',
      message: '0',
      color: 'brightgreen',
    })
    given({ value: 0, metric: 'test_errors' }).expect({
      label: 'test errors',
      message: '0',
      color: 'brightgreen',
    })
    given({ value: 2, metric: 'test_failures' }).expect({
      label: 'test failures',
      message: '2',
      color: 'red',
    })
    given({ value: 1, metric: 'test_errors' }).expect({
      label: 'test errors',
      message: '1',
      color: 'red',
    })
    given({ value: 100, metric: 'test_success_density' }).expect({
      label: 'tests',
      message: '100%',
      color: 'brightgreen',
    })
    given({ value: 93, metric: 'test_success_density' }).expect({
      label: 'tests',
      message: '93%',
      color: 'red',
    })
  })

  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarTests,
        'BasicAuth',
        legacySonarResponse('tests', 95),
        { configOverride: testAuthConfigOverride },
      )
    })
  })
})
