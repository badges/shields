import { testAuth } from '../test-helpers.js'
import JenkinsCoverage from './jenkins-coverage.service.js'

const authConfigOverride = {
  public: {
    services: {
      jenkins: {
        authorizedOrigins: ['https://jenkins.mm12.xyz'],
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
        { projectStatistics: { line: '93.0%' } },
        { configOverride: authConfigOverride },
      )
    })
  })
})
