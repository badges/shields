import { testAuth } from '../test-helpers.js'
import JiraIssue from './jira-issue.service.js'
import { config } from './jira-test-helpers.js'

describe('JiraIssue', function () {
  describe('auth', function () {
    it('sends the auth information as configured', async function () {
      testAuth(
        JiraIssue,
        'BasicAuth',
        {
          fields: {
            status: {
              name: 'in progress',
            },
          },
        },
        { configOverride: config },
      )
    })
  })
})
