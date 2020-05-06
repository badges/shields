'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const JiraSprint = require('./jira-sprint.service')
const {
  user,
  pass,
  host,
  config,
  sprintId,
  sprintQueryString,
} = require('./jira-test-helpers')

describe('JiraSprint', function () {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function () {
    const scope = nock(`https://${host}`)
      .get('/jira/rest/api/2/search')
      .query(sprintQueryString)
      // This ensures that the expected credentials are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({ user, pass })
      .reply(200, {
        total: 2,
        issues: [
          { fields: { resolution: { name: 'done' } } },
          { fields: { resolution: { name: 'Unresolved' } } },
        ],
      })

    expect(
      await JiraSprint.invoke(
        defaultContext,
        config,
        {
          sprintId,
        },
        { baseUrl: `https://${host}/jira` }
      )
    ).to.deep.equal({
      label: 'completion',
      message: '50%',
      color: 'orange',
    })

    scope.done()
  })
})
