import { testAuth } from '../test-helpers.js'
import StackExchangeMonthlyQuestions from './stackexchange-monthlyquestions.service.js'

describe('StackExchangeMonthlyQuestions', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        StackExchangeMonthlyQuestions,
        'QueryStringAuth',
        {
          total: 8,
        },
        { queryPassKey: 'key' },
      )
    })
  })
})
