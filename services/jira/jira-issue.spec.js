import { expect } from 'chai'
import nock from 'nock'
import { cleanUpNockAfterEach, defaultContext } from '../test-helpers.js'
import JiraIssue from './jira-issue.service.js'
import { user, pass, host, config } from './jira-test-helpers.js'

describe('JiraIssue', function () {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function () {
    const scope = nock(`https://${host}`)
      .get(`/rest/api/2/issue/${encodeURIComponent('secure-234')}`)
      // This ensures that the expected credentials are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({ user, pass })
      .reply(200, { fields: { status: { name: 'in progress' } } })

    expect(
      await JiraIssue.invoke(
        defaultContext,
        config,
        {
          issueKey: 'secure-234',
        },
        { baseUrl: `https://${host}` }
      )
    ).to.deep.equal({
      label: 'secure-234',
      message: 'in progress',
      color: 'lightgrey',
    })

    scope.done()
  })
})
