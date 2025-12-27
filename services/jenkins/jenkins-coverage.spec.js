import { testAuth } from '../test-helpers.js'
import JenkinsCoverage from './jenkins-coverage.service.js'

const authConfigOverride = {
  public: {
    services: {
      jenkins: {
        authorizedOrigins: ['https://ci-maven.apache.org'],
      },
    },
  },
}

describe('JenkinsCoverage', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        JenkinsCoverage,
        'BasicAuth',
        { instructionCoverage: { percentage: 93 } },
        { configOverride: authConfigOverride },
      )
    })
  })
})
