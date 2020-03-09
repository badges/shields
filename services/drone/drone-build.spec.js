'use strict'

const { expect } = require('chai')
const nock = require('nock')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')
const DroneBuild = require('./drone-build.service')

describe('DroneBuild', function() {
  cleanUpNockAfterEach()

  it('Sends auth headers to cloud instance', async function() {
    const token = 'abc123'

    const scope = nock('https://cloud.drone.io', {
      reqheaders: { Authorization: `Bearer abc123` },
    })
      .get(/.*/)
      .reply(200, { status: 'passing' })

    expect(
      await DroneBuild.invoke(
        defaultContext,
        {
          public: {
            services: {
              drone: {
                authorizedOrigins: ['https://cloud.drone.io'],
              },
            },
          },
          private: {
            drone_token: token,
          },
        },
        { user: 'atlassian', repo: 'python-bitbucket' }
      )
    ).to.deep.equal({
      label: undefined,
      message: 'passing',
      color: 'brightgreen',
    })

    scope.done()
  })
})
