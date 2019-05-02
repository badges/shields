'use strict'

const { expect } = require('chai')
const nock = require('nock')
const [BitbucketPullRequest] = require('./bitbucket-pull-request.service')
const { cleanUpNockAfterEach, defaultContext } = require('../test-helpers')

describe('BitbucketPullRequest', function() {
  cleanUpNockAfterEach()

  it('Sends auth headers to Bitbucket Cloud', async function() {
    const user = 'admin'
    const pass = 'abc123'

    const scope = nock('https://bitbucket.org/api/2.0/repositories/')
      .get(/.*/)
      .basicAuth({ user, pass })
      .reply(200, { size: 42 })

    const serviceData = await BitbucketPullRequest.invoke(
      defaultContext,
      {
        private: { bitbucket_username: user, bitbucket_password: pass },
      },
      { user: 'atlassian', repo: 'python-bitbucket' }
    )

    scope.done()

    expect(serviceData).to.deep.equal({
      color: 'yellow',
      message: '42',
    })
  })

  it('Sends auth headers to Bitbucket Server', async function() {
    const user = 'admin'
    const pass = 'abc123'

    const scope = nock('https://bitbucket.mydomain.test/rest/api/1.0/projects')
      .get(/.*/)
      .basicAuth({ user, pass })
      .reply(200, { size: 42 })

    const serviceData = await BitbucketPullRequest.invoke(
      defaultContext,
      {
        private: {
          bitbucket_server_username: user,
          bitbucket_server_password: pass,
        },
      },
      {
        user: 'project',
        repo: 'repo',
      },
      {
        server: 'https://bitbucket.mydomain.test',
      }
    )

    scope.done()

    expect(serviceData).to.deep.equal({
      color: 'yellow',
      message: '42',
    })
  })
})
