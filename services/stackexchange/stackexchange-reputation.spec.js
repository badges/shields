import { testAuth } from '../test-helpers.js'
import StackExchangeReputation from './stackexchange-reputation.service.js'

describe('StackExchangeReputation', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        StackExchangeReputation,
        'QueryStringAuth',
        {
          items: [{ reputation: 8 }],
        },
        { queryPassKey: 'key' },
      )
    })
  })
})
