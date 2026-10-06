import { testAuth } from '../test-helpers.js'
import DiscordOnline from './discord-online.service.js'

describe('DiscordOnline', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        DiscordOnline,
        'BearerAuthHeader',
        { approximate_presence_count: 15, approximate_member_count: 50 },
        { bearerHeaderKey: 'Bot' },
      )
    })
  })
})
