import { testAuth } from '../test-helpers.js'
import JenkinsCoverage from './jenkins-coverage.service.js'

const authConfigOverride = {
  public: {
    services: {
      jenkins: {
        authorizedOrigins: ['https://jenkins.sqlalchemy.org'],
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
        { results: { elements: [{ name: 'Lines', ratio: 88 }] } },
        { configOverride: authConfigOverride },
      )
    })
  })
})
