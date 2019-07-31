'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const JiraIssue = require('./jira-issue.service')
const { user, pass, config } = require('./jira-test-helpers')

describe('JiraIssue', function() {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function() {
    const scope = nock('https://myprivatejira.test')
      .get(`/rest/api/2/issue/${encodeURIComponent('secure-234')}`)
      // This ensures that the expected credentials are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({ user, pass })
      .reply(200, { fields: { status: { name: 'in progress' } } })

    expect(
      await JiraIssue.invoke(defaultContext, config, {
        protocol: 'https',
        hostAndPath: 'myprivatejira.test',
        issueKey: 'secure-234',
      })
    ).to.deep.equal({
      label: 'secure-234',
      message: 'in progress',
      color: 'lightgrey',
    })

    scope.done()
  })
})
