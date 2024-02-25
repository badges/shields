import { testAuth } from '../test-helpers.js'
import JenkinsTests from './jenkins-tests.service.js'

const authConfigOverride = {
  public: {
    services: {
      jenkins: {
        authorizedOrigins: ['https://jenkins.sqlalchemy.org'],
      },
    },
  },
}

describe('JenkinsTests', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        JenkinsTests,
        'BasicAuth',
        { actions: [{ totalCount: 3, failCount: 2, skipCount: 1 }] },
        {
          configOverride: authConfigOverride,
          exampleOverride: { compact_message: '' },
        },
      )
    })
  })
})
