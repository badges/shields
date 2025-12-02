import { testAuth } from '../test-helpers.js'
import SymfonyInsightGrade from './symfony-insight-grade.service.js'

describe('SymfonyInsightGrade', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SymfonyInsightGrade,
        'BasicAuth',
        `<project><last-analysis>
          <grade>gold</grade>
          <status>finished</status>
        </last-analysis></project>`,
      )
    })
  })
})
