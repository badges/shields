import { testAuth } from '../test-helpers.js'
import StackExchangeQuestions from './stackexchange-taginfo.service.js'

describe('StackExchangeQuestions', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        StackExchangeQuestions,
        'QueryStringAuth',
        {
          items: [{ count: 8 }],
        },
        { queryPassKey: 'key' },
      )
    })
  })
})
