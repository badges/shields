import nock from 'nock'
import DockerAutomatedBuild from './docker-automated.service.js'

describe('DockerAutomatedBuild', function () {
  describe('auth', function () {
    beforeEach(function () {
      nock.cleanAll()
    })

    it('sends the auth information as configured', async function () {
      const loginEndpoint = 'https://hub.docker.com/v2/users/login/'
      const token =
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjk5OTk5OTk5OTl9.signature'

      nock(loginEndpoint)
        .post(/.*/, { username: 'valid-username', password: 'valid-password' })
        .reply(
          200,
          { token },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )

      nock('https://registry.hub.docker.com')
        .get('/v2/repositories/valid-username/valid-repo')
        .reply(
          200,
          { is_automated: true },
          {
            headers: {
              'content-type': 'application/json',
            },
          },
        )

      return DockerAutomatedBuild.auth({
        jwtLoginEndpoint: loginEndpoint,
        username: 'valid-username',
        password: 'valid-password',
      })
    })
  })
})
