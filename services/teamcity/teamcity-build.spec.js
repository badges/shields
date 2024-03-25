import { testAuth } from '../test-helpers.js'
import TeamCityBuild from './teamcity-build.service.js'
import { config } from './teamcity-test-helpers.js'

describe('TeamCityBuild', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      testAuth(
        TeamCityBuild,
        'BasicAuth',
        { status: 'SUCCESS', statusText: 'Success' },
        { configOverride: config },
      )
    })
  })
})
