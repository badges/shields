import { test, forCases, given } from 'sazerac'
import { renderBuildStatusBadge } from '../build-status.js'
import { testAuth } from '../test-helpers.js'
import JenkinsBuild from './jenkins-build.service.js'

const authConfigOverride = {
  public: {
    services: {
      jenkins: {
        authorizedOrigins: ['https://ci.eclipse.org'],
      },
    },
  },
}

describe('JenkinsBuild', function () {
  test(JenkinsBuild.prototype.transform, () => {
    forCases([
      given({ json: { color: 'red_anime' } }),
      given({ json: { color: 'yellow_anime' } }),
      given({ json: { color: 'blue_anime' } }),
      given({ json: { color: 'green_anime' } }),
      given({ json: { color: 'grey_anime' } }),
      given({ json: { color: 'disabled_anime' } }),
      given({ json: { color: 'aborted_anime' } }),
      given({ json: { color: 'notbuilt_anime' } }),
    ]).expect({
      status: 'building',
    })
    forCases([
      given({ json: { color: 'grey' } }),
      given({ json: { color: 'disabled' } }),
      given({ json: { color: 'aborted' } }),
      given({ json: { color: 'notbuilt' } }),
    ]).expect({
      status: 'not built',
    })
    forCases([
      given({ json: { color: 'blue' } }),
      given({ json: { color: 'green' } }),
    ]).expect({
      status: 'passing',
    })
    given({ json: { color: 'red' } }).expect({ status: 'failing' })
    given({ json: { color: 'yellow' } }).expect({ status: 'unstable' })
  })

  test(JenkinsBuild.render, () => {
    given({ status: 'unstable' }).expect({
      message: 'unstable',
      color: 'yellow',
    })
    given({ status: 'passing' }).expect(
      renderBuildStatusBadge({ status: 'passing' }),
    )
    given({ status: 'failing' }).expect(
      renderBuildStatusBadge({ status: 'failing' }),
    )
    given({ status: 'building' }).expect(
      renderBuildStatusBadge({ status: 'building' }),
    )
    given({ status: 'not built' }).expect(
      renderBuildStatusBadge({ status: 'not built' }),
    )
  })

  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        JenkinsBuild,
        'BasicAuth',
        { color: 'blue' },
        { configOverride: authConfigOverride },
      )
    })
  })
})
