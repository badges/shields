import { testAuth } from '../test-helpers.js'
import DockerAutomatedBuild from './docker-automated.service.js'

describe('DockerAutomatedBuild', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        DockerAutomatedBuild,
        'JwtAuth',
        { is_automated: true },
        { jwtLoginEndpoint: 'https://hub.docker.com/v2/users/login/' },
      )
    })
  })
})
