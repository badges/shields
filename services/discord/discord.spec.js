import { testAuth } from '../test-helpers.js'
import Discord from './discord.service.js'

describe('Discord', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(Discord, { presence_count: 125 })
    })
  })
})
