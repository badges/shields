import { testAuth } from '../test-helpers.js'
import StackExchangeReputation from './stackexchange-reputation.service.js'

describe('StackExchangeReputation', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(StackExchangeReputation, { items: [{ reputation: 8 }] })
    })
  })
})
