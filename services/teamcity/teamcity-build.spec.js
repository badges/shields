'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const TeamCityBuild = require('./teamcity-build.service')
const { user, pass, host, config } = require('./teamcity-test-helpers')

describe('TeamCityBuild', function () {
  cleanUpNockAfterEach()

  it('sends the auth information as configured', async function () {
    const scope = nock(`https://${host}`)
      .get(`/app/rest/builds/${encodeURIComponent('buildType:(id:bt678)')}`)
      // This ensures that the expected credentials are actually being sent with the HTTP request.
      // Without this the request wouldn't match and the test would fail.
      .basicAuth({ user, pass })
      .reply(200, {
        status: 'FAILURE',
        statusText:
          'Tests failed: 1 (1 new), passed: 50246, ignored: 1, muted: 12',
      })

    expect(
      await TeamCityBuild.invoke(
        defaultContext,
        config,
        {
          verbosity: 'e',
          buildId: 'bt678',
        },
        { server: `https://${host}` }
      )
    ).to.deep.equal({
      message: 'tests failed: 1 (1 new), passed: 50246, ignored: 1, muted: 12',
      color: 'red',
    })

    scope.done()
  })
})
