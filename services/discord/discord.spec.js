import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import Discord from './discord.service.js'

describe('Discord', function () {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function () {
    const pass = 'password'
    const config = {
      private: {
        discord_bot_token: pass,
      },
    }

    const scope = nock(`https://discord.com`, {
      // This ensures that the expected credential is actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      reqheaders: { Authorization: `Bot password` },
    })
      .get(`/api/v6/guilds/12345/widget.json`)
      .reply(200, {
        presence_count: 125,
      })

    expect(
      await Discord.invoke(defaultContext, config, {
        serverId: '12345',
      })
    ).to.deep.equal({
      message: '125 online',
      color: 'brightgreen',
    })

    scope.done()
  })
})
