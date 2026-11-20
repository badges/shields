import { test, given } from 'sazerac'
import { testAuth } from '../test-helpers.js'
import SonarSecurityRating from './sonar-security-rating.service.js'
import {
  legacySonarResponse,
  testAuthConfigOverride,
} from './sonar-spec-helpers.js'

describe('SonarSecurityRating', function () {
  test(SonarSecurityRating.render, () => {
    given({ rating: 1 }).expect({
      message: 'A',
      color: 'brightgreen',
    })
    given({ rating: 2 }).expect({
      message: 'B',
      color: 'green',
    })
    given({ rating: 3 }).expect({
      message: 'C',
      color: 'yellow',
    })
    given({ rating: 4 }).expect({
      message: 'D',
      color: 'orange',
    })
    given({ rating: 5 }).expect({
      message: 'E',
      color: 'red',
    })
    given({ rating: 2.4 }).expect({
      message: 'B',
      color: 'green',
    })
    given({ rating: 2.5 }).expect({
      message: 'C',
      color: 'yellow',
    })
    given({ rating: 0 }).expect({
      message: 'unknown',
      color: 'lightgrey',
    })
    given({ rating: 6 }).expect({
      message: 'unknown',
      color: 'lightgrey',
    })
    given({ rating: NaN }).expect({
      message: 'unknown',
      color: 'lightgrey',
    })
    given({ rating: 'abc' }).expect({
      message: 'unknown',
      color: 'lightgrey',
    })
    given({ rating: '3' }).expect({
      message: 'C',
      color: 'yellow',
    })
  })

  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SonarSecurityRating,
        'BasicAuth',
        legacySonarResponse('security_rating', 1),
        { configOverride: testAuthConfigOverride },
      )
    })
  })
})
