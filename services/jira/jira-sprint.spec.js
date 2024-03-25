import { testAuth } from '../test-helpers.js'
import JiraSprint from './jira-sprint.service.js'
import { config } from './jira-test-helpers.js'

describe('JiraSprint', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      testAuth(
        JiraSprint,
        'BasicAuth',
        {
          total: 2,
          issues: [
            { fields: { resolution: { name: 'done' } } },
            { fields: { resolution: { name: 'Unresolved' } } },
          ],
        },
        { configOverride: config },
      )
    })
  })
})
