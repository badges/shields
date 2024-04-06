import { testAuth } from '../test-helpers.js'
import SymfonyInsightStars from './symfony-insight-stars.service.js'

describe('SymfonyInsightStars', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      return testAuth(
        SymfonyInsightStars,
        'BasicAuth',
        `<project><last-analysis>
          <grade>gold</grade>
          <status>finished</status>
        </last-analysis></project>`,
        { contentType: 'application/vnd.com.sensiolabs.insight+xml' },
      )
    })
  })
})
