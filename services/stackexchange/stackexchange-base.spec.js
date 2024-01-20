import { testAuth } from '../test-helpers.js'
import StackExchangeMonthlyQuestions from './stackexchange-monthlyquestions.service.js'
import StackExchangeReputation from './stackexchange-reputation.service.js'
import StackExchangeQuestions from './stackexchange-taginfo.service.js'

// format is [class, example response from server]
const testClasses = [
  [StackExchangeMonthlyQuestions, { total: 8 }],
  [StackExchangeReputation, { items: [{ reputation: 8 }] }],
  [StackExchangeQuestions, { items: [{ count: 8 }] }],
]

for (const [serviceClass, dummyResponse] of testClasses) {
  describe(`${serviceClass.name}`, function () {
    describe('auth', function () {
      it('sends the auth information as configured', async function () {
        return testAuth(serviceClass, dummyResponse)
      })
    })
  })
}
