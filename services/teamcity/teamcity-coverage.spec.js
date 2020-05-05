'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const TeamCityCoverage = require('./teamcity-coverage.service')
const { user, pass, host, config } = require('./teamcity-test-helpers')

describe('TeamCityCoverage', function () {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function () {
    const scope = nock(`https://${host}`)
      .get(
        `/app/rest/builds/${encodeURIComponent(
          'buildType:(id:bt678)'
        )}/statistics`
      )
      .query({})
      // This ensures that the expected credentials are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({ user, pass })
      .reply(200, {
        property: [
          { name: 'CodeCoverageAbsSCovered', value: '82' },
          { name: 'CodeCoverageAbsSTotal', value: '100' },
        ],
      })

    expect(
      await TeamCityCoverage.invoke(
        defaultContext,
        config,
        {
          buildId: 'bt678',
        },
        { server: 'https://mycompany.teamcity.com' }
      )
    ).to.deep.equal({
      message: '82%',
      color: 'yellowgreen',
    })

    scope.done()
  })
})
